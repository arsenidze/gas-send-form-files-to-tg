const getSheetById = (ss, sheetId) => {
  const sheets = ss.getSheets();
  const sheet = sheets.find((s) => s.getSheetId() === sheetId);
  if (!sheet) {
    return {
      data: undefined,
      error: 'Sheet в таблиці за таким URL не знайдено',
    };
  }
  return { data: sheet, error: undefined };
};

export const getSpreadSheetInfo = (spreadSheetUrl) => {
  try {
    const regex = /\/d\/([a-zA-Z0-9-_]+)\/.*gid=([0-9]+)/;
    const match = regex.exec(spreadSheetUrl);
    if (match && match[1] && match[2]) {
      const spreadSheetId = match[1];
      const sheetId = parseInt(match[2], 10);
      let spreadsheet;
      try {
        spreadsheet = SpreadsheetApp.openById(spreadSheetId);
        if (!spreadsheet) {
          return {
            data: undefined,
            error: 'Spreadsheet за таким URL не знайдено',
          };
        }
      } catch (err) {
        Logger.log(err.message);
        return {
          data: undefined,
          error: 'Spreadsheet за таким URL не знайдено',
        };
      }

      const { data: sheet, error } = getSheetById(spreadsheet, sheetId);
      if (error) {
        return { data: undefined, error };
      }

      return {
        data: {
          spreadSheetUrl,
          spreadSheetName: spreadsheet.getName(),
          sheetName: sheet.getName(),
          spreadSheetId,
          sheetId,
        },
        error: undefined,
      };
    }
    return {
      data: undefined,
      error:
        'Невірний формат URL. Формат: https://docs.google.com/spreadsheets/d/.../edit#gid=...',
    };
  } catch (err) {
    Logger.log(err.message);
    return {
      data: undefined,
      error: `Сталась наступна помилка: ${err.message}`,
    };
  }
};

export const getSpreadSheetHeaders = (spreadSheetInfo) => {
  try {
    const ss = SpreadsheetApp.openById(spreadSheetInfo.spreadSheetId);
    const sheet = getSheetById(ss, spreadSheetInfo.sheetId);
    const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headers = range.getValues()[0];

    return { data: headers, error: undefined };
  } catch (err) {
    Logger.log(err.message);
    return { data: undefined, error: err.message };
  }
};
