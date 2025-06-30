// =============================================================================
// 汎用グループカレンダーアプリケーション
// Google Apps Script (GAS) バックエンドコード
// =============================================================================

/**
 * 設定セクション - ここを編集してカスタマイズしてください
 */
const CONFIG = {
  // アプリケーション名
  APP_NAME: "グループカレンダー",
  
  // デフォルトカレンダー設定
  DEFAULT_CALENDARS: [
    // 例: 共有カレンダーがある場合はここに追加
    // {
    //   id: "your-shared-calendar-id@group.calendar.google.com",
    //   name: "共有カレンダー"
    // }
  ],
  
  // 組織単位（OU）とカレンダーのマッピング
  // Google Workspace組織を使用している場合のみ設定
  OU_TO_CALENDAR: {
    // 例:
    // "/Sales": [
    //   {
    //     id: "sales-calendar@group.calendar.google.com",
    //     name: "営業部カレンダー"
    //   }
    // ],
    // "/Engineering": [
    //   {
    //     id: "engineering-calendar@group.calendar.google.com", 
    //     name: "エンジニアリング部カレンダー"
    //   }
    // ]
  },
  
  // Google Workspaceを使用するかどうか
  USE_GOOGLE_WORKSPACE: false, // 個人利用の場合はfalse、組織利用の場合はtrue
  
  // ヘルプドキュメントURL（必要に応じて変更）
  HELP_URL: "https://support.google.com/calendar/",
  
  // 週の開始曜日 (0: 日曜日, 1: 月曜日)
  WEEK_START_DAY: 0
};

/**
 * 現在表示中の日付を保持するグローバル変数
 */
let currentDisplayDate = new Date();

/**
 * 曜日の配列
 */
const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * ユーザー情報を取得する関数
 * Google Workspaceの場合はAdminDirectory APIを使用、個人の場合は簡易版
 */
function getUserInfo(email) {
  try {
    if (CONFIG.USE_GOOGLE_WORKSPACE) {
      // Google Workspace環境での詳細情報取得
      const user = AdminDirectory.Users.get(email);
      return {
        displayName: user.name.fullName,
        department: (user.organizations && user.organizations.length > 0 && user.organizations[0].department)
          ? user.organizations[0].department
          : '部署情報なし'
      };
    } else {
      // 個人利用環境での簡易情報取得
      const displayName = email.includes('@') ? email.split('@')[0] : email;
      return {
        displayName: displayName,
        department: '個人'
      };
    }
  } catch (error) {
    console.error(`Error in getUserInfo for ${email}: ${error.stack || error}`);
    return {
      displayName: email.split('@')[0],
      department: '取得不可'
    };
  }
}

/**
 * ユーザーの組織単位パスを取得
 * Google Workspaceを使用していない場合はnullを返す
 */
function getUserOrgUnitPath(userEmail) {
  try {
    if (!CONFIG.USE_GOOGLE_WORKSPACE) {
      return null;
    }
    
    if (!userEmail) {
      userEmail = Session.getActiveUser().getEmail();
    }
    const user = AdminDirectory.Users.get(userEmail);
    return user.orgUnitPath;
  } catch (error) {
    console.error(`Error getting user orgUnitPath: ${error.stack || error}`);
    return null;
  }
}

/**
 * 指定したOUに対応するカレンダー情報を取得
 */
function getCalendarIdsForUserOu(orgUnitPath) {
  const calendarIds = [];

  if (!orgUnitPath || !CONFIG.USE_GOOGLE_WORKSPACE) {
    // 組織単位が無い場合はデフォルトカレンダーのみ返す
    return [...CONFIG.DEFAULT_CALENDARS];
  }

  // 完全一致のカレンダーを追加
  if (CONFIG.OU_TO_CALENDAR[orgUnitPath]) {
    const calendars = CONFIG.OU_TO_CALENDAR[orgUnitPath];
    if (Array.isArray(calendars)) {
      calendars.forEach(calendarInfo => {
        calendarIds.push({
          id: calendarInfo.id,
          name: calendarInfo.name
        });
      });
    } else {
      calendarIds.push({
        id: calendars.id,
        name: calendars.name
      });
    }
  }

  // 親OUのカレンダーを追加（階層を上に向かって検索）
  const pathParts = orgUnitPath.split('/');
  for (let i = pathParts.length - 1; i > 0; i--) {
    const parentPath = pathParts.slice(0, i).join('/');
    if (CONFIG.OU_TO_CALENDAR[parentPath]) {
      const calendars = CONFIG.OU_TO_CALENDAR[parentPath];
      if (Array.isArray(calendars)) {
        calendars.forEach(calendarInfo => {
          calendarIds.push({
            id: calendarInfo.id,
            name: calendarInfo.name
          });
        });
      } else {
        calendarIds.push({
          id: calendars.id,
          name: calendars.name
        });
      }
    }
  }

  // デフォルトカレンダーも追加
  CONFIG.DEFAULT_CALENDARS.forEach(calendar => {
    calendarIds.push(calendar);
  });

  return calendarIds;
}

/**
 * 現在のユーザーが表示すべきカレンダーIDを取得
 */
function getCurrentCalendarIds() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const orgUnitPath = getUserOrgUnitPath(userEmail);
    return getCalendarIdsForUserOu(orgUnitPath);
  } catch (error) {
    console.error(`Error getting calendar IDs: ${error.stack || error}`);
    return [...CONFIG.DEFAULT_CALENDARS];
  }
}

/**
 * ユーザーの個人カレンダー情報を取得
 */
function getUserCalendarId(userEmail) {
  try {
    if (!userEmail) {
      userEmail = Session.getActiveUser().getEmail();
    }

    const userInfo = getUserInfo(userEmail);
    return {
      id: userEmail,
      name: userInfo.displayName + "の個人カレンダー"
    };
  } catch (error) {
    console.error(`Error getting user calendar ID: ${error.stack || error}`);
    return null;
  }
}

/**
 * 指定した週のイベントを取得
 */
function getEventsForWeek(targetDate, calendarId) {
  // 週の開始日を計算
  const startOfWeek = new Date(targetDate);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek - CONFIG.WEEK_START_DAY;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // 週の終了日を計算
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const events = Calendar.Events.list(calendarId, {
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500
    });

    return {
      events: events.items || [],
      startOfWeek: startOfWeek,
      endOfWeek: endOfWeek
    };
  } catch (error) {
    console.error(`Error getting events for calendar ${calendarId}: ${error.stack || error}`);
    return {
      events: [],
      startOfWeek: startOfWeek,
      endOfWeek: endOfWeek
    };
  }
}

/**
 * カレンダー名を取得
 */
function getCalendarName(calendarId) {
  try {
    const calendar = Calendar.Calendars.get(calendarId);
    return calendar.summary;
  } catch (e) {
    console.error(`カレンダー名の取得に失敗しました: ${e.message}`);
    return "不明なカレンダー";
  }
}

/**
 * 日付をヘッダー用にフォーマット
 */
function formatHeaderDateJp(date) {
  const d = date.getDate();
  const w = daysOfWeek[date.getDay()];
  return `${d}日(${w})`;
}

/**
 * 年月をフォーマット
 */
function formatMonthYear(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}年${m}月`;
}

/**
 * 時刻をフォーマット
 */
function formatTimeJp(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm");
}

/**
 * 指定日のイベントをフィルタリング
 */
function getEventsForDay(events, dayDate) {
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayDate);
  dayEnd.setHours(23, 59, 59, 999);

  return events.filter(event => {
    const eventStart = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
    const eventEnd = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);

    // 終日イベントの処理
    const isAllDayEvent = !event.start.dateTime;
    if (isAllDayEvent) {
      const adjustedEnd = new Date(eventEnd);
      adjustedEnd.setDate(adjustedEnd.getDate() - 1);
      adjustedEnd.setHours(23, 59, 59, 999);
      return (eventStart <= dayEnd && adjustedEnd >= dayStart);
    }

    // 通常イベント
    return (eventStart <= dayEnd && eventEnd >= dayStart);
  });
}

/**
 * 週カレンダーのヘッダーHTMLを作成
 */
function createHeaderHtml(startOfWeek, calendarId) {
  let html = '<tr>';
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    const isSaturday = currentDay.getDay() === 6;
    const isSunday = currentDay.getDay() === 0;
    const dayClass = isSaturday ? "saturday" : isSunday ? "sunday" : "";

    html += `<th class="${dayClass} relative">
      ${formatHeaderDateJp(currentDay)}
      <button class="add-event-button absolute right-2 top-1/2 transform -translate-y-1/2"
              data-date="${currentDay.toISOString()}"
              data-calendar-id="${calendarId}"
              title="予定を追加">
        <span class="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 hover:bg-gray-100">＋</span>
      </button>
    </th>`;
  }
  html += '</tr>';
  return html;
}

/**
 * 週カレンダーの本文HTMLを作成
 */
function createTableHtml(events, startOfWeek) {
  let html = `<tr>`;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(currentDay.getDate() + i);
    currentDay.setHours(0, 0, 0, 0);

    const dayEvents = getEventsForDay(events, currentDay);
    const isSaturday = currentDay.getDay() === 6;
    const isSunday = currentDay.getDay() === 0;
    const dayClass = isSaturday ? "saturday" : isSunday ? "sunday" : "";

    const isToday = currentDay.getTime() === today.getTime();
    const isPast = currentDay.getTime() < today.getTime();

    html += `<td class="${dayClass} calendar-cell">`;

    if (dayEvents.length === 0) {
      html += `<div class="no-events">予定なし</div>`;
    } else {
      dayEvents.forEach(ev => {
        const evStart = ev.start.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start.date);
        const evEnd = ev.end.dateTime ? new Date(ev.end.dateTime) : new Date(ev.end.date);
        const summary = ev.summary || "(無題)";
        const startTime = ev.start.dateTime ? formatTimeJp(evStart) : "終日";
        const endTime = ev.end.dateTime ? formatTimeJp(evEnd) : "";
        const timeStr = (startTime && endTime) ? `${startTime} - ${endTime}` : startTime;

        const eventClass = isToday
          ? "event-today"
          : isPast
          ? "event-past"
          : "event-future";

        const creatorEmail = ev.creator && ev.creator.email
          ? ev.creator.email
          : ev.organizer && ev.organizer.email
          ? ev.organizer.email
          : null;
        const creatorInfo = creatorEmail
          ? getUserInfo(creatorEmail)
          : { displayName: "不明", department: "不明" };

        const description = ev.description ? ev.description : 'なし';
        const tooltipText = `タイトル: ${summary}\\n時間: ${timeStr}\\n登録者: ${creatorInfo.displayName}\\n部署: ${creatorInfo.department}\\n詳細: ${description}`;

        let eventEditUrl = "#";
        if (ev.htmlLink) {
          const match = ev.htmlLink.match(/eid=([^&]+)/);
          if (match && match[1]) {
            const eid = match[1];
            eventEditUrl = `https://calendar.google.com/calendar/u/0/r/eventedit/${eid}`;
          } else {
            eventEditUrl = ev.htmlLink;
          }
        }

        html += `
          <div class="event-card ${eventClass}"
               style="cursor: pointer;"
               title="${escapeHtml(tooltipText)}"
               onclick="window.open('${eventEditUrl}', '_blank')">
            <div class="event-title">${escapeHtml(summary)}</div>
            <div class="event-time">${escapeHtml(timeStr)}</div>
            <div class="event-creator" style="font-size: 0.75rem; opacity: 0.9;">登録者:${escapeHtml(creatorInfo.displayName)}</div>
          </div>
        `;
      });
    }
    html += `</td>`;
  }
  html += `</tr>`;
  return html;
}

/**
 * HTMLエスケープ処理
 */
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 初期データを読み込む
 */
function loadInitialData() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const groupCalendarIds = getCurrentCalendarIds();
    const userCalendarId = getUserCalendarId(userEmail);

    let calendarIds = [...groupCalendarIds];
    if (userCalendarId) {
      calendarIds.push(userCalendarId);
    }

    if (calendarIds.length === 0) {
      return { error: "表示可能なカレンダーがありません。" };
    }

    // 今日の日付を基準とした週を表示
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    currentDisplayDate = targetDate;

    const calendarsData = calendarIds.map(calendarInfo => {
      const result = getEventsForWeek(targetDate, calendarInfo.id);
      return {
        calendarId: calendarInfo.id,
        calendarName: calendarInfo.name,
        headerHtml: createHeaderHtml(result.startOfWeek, calendarInfo.id),
        eventsHtml: createTableHtml(result.events, result.startOfWeek),
        monthYear: formatMonthYear(result.startOfWeek),
        currentDate: result.startOfWeek.toISOString()
      };
    });

    return { calendars: calendarsData };
  } catch (error) {
    console.error(`Error in loadInitialData: ${error.stack || error}`);
    return { error: "データの読み込みに失敗しました。" };
  }
}

/**
 * 前週表示
 */
function prevWeek(currentDate) {
  currentDisplayDate = new Date(currentDate);
  currentDisplayDate.setDate(currentDisplayDate.getDate() - 7);

  const userEmail = Session.getActiveUser().getEmail();
  const groupCalendarIds = getCurrentCalendarIds();
  const userCalendarId = getUserCalendarId(userEmail);

  let calendarIds = [...groupCalendarIds];
  if (userCalendarId) {
    calendarIds.push(userCalendarId);
  }

  const calendarsData = calendarIds.map(calendarInfo => {
    const result = getEventsForWeek(currentDisplayDate, calendarInfo.id);
    return {
      calendarId: calendarInfo.id,
      calendarName: calendarInfo.name,
      headerHtml: createHeaderHtml(result.startOfWeek, calendarInfo.id),
      eventsHtml: createTableHtml(result.events, result.startOfWeek),
      monthYear: formatMonthYear(result.startOfWeek),
      currentDate: result.startOfWeek.toISOString()
    };
  });

  return { calendars: calendarsData };
}

/**
 * 次週表示
 */
function nextWeek(currentDate) {
  currentDisplayDate = new Date(currentDate);
  currentDisplayDate.setDate(currentDisplayDate.getDate() + 7);

  const userEmail = Session.getActiveUser().getEmail();
  const groupCalendarIds = getCurrentCalendarIds();
  const userCalendarId = getUserCalendarId(userEmail);

  let calendarIds = [...groupCalendarIds];
  if (userCalendarId) {
    calendarIds.push(userCalendarId);
  }

  const calendarsData = calendarIds.map(calendarInfo => {
    const result = getEventsForWeek(currentDisplayDate, calendarInfo.id);
    return {
      calendarId: calendarInfo.id,
      calendarName: calendarInfo.name,
      headerHtml: createHeaderHtml(result.startOfWeek, calendarInfo.id),
      eventsHtml: createTableHtml(result.events, result.startOfWeek),
      monthYear: formatMonthYear(result.startOfWeek),
      currentDate: result.startOfWeek.toISOString()
    };
  });

  return { calendars: calendarsData };
}

/**
 * 今日の週に戻る
 */
function toToday() {
  currentDisplayDate = new Date();
  currentDisplayDate.setHours(0, 0, 0, 0);

  const userEmail = Session.getActiveUser().getEmail();
  const groupCalendarIds = getCurrentCalendarIds();
  const userCalendarId = getUserCalendarId(userEmail);

  let calendarIds = [...groupCalendarIds];
  if (userCalendarId) {
    calendarIds.push(userCalendarId);
  }

  const calendarsData = calendarIds.map(calendarInfo => {
    const result = getEventsForWeek(currentDisplayDate, calendarInfo.id);
    return {
      calendarId: calendarInfo.id,
      calendarName: calendarInfo.name,
      headerHtml: createHeaderHtml(result.startOfWeek, calendarInfo.id),
      eventsHtml: createTableHtml(result.events, result.startOfWeek),
      monthYear: formatMonthYear(result.startOfWeek),
      currentDate: result.startOfWeek.toISOString()
    };
  });

  return { calendars: calendarsData };
}

/**
 * カレンダーを開くためのURLを生成
 */
function getCalendarUrlForUser(calendarId) {
  const baseUrl = 'https://calendar.google.com/calendar/u/0/r';
  const param = '?cid=' + encodeURIComponent(calendarId);
  return baseUrl + param;
}

/**
 * Webアプリケーションのエントリーポイント
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
