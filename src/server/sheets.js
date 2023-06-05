/* eslint-disable no-restricted-syntax */
import { getSpreadSheetConfiguration } from './storage';
import { sendFilesToTgChat } from './telegramBotApi';

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
    const { data: sheet, error } = getSheetById(
      ss,
      parseInt(spreadSheetInfo.sheetId, 10)
    );
    if (error) {
      return { data: undefined, error };
    }
    const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headers = range.getValues()[0];

    return { data: headers, error: undefined };
  } catch (err) {
    Logger.log(err.message);
    return { data: undefined, error: err.message };
  }
};

// {
//   "namedValues": {
//       "питання1": [
//           "Option 1"
//       ],
//       "Email Address": [
//           "arsenidze@urk.net"
//       ],
//       "Timestamp": [
//           "6/3/2023 15:32:44"
//       ],
//       "питання2": [
//           ""
//       ],
//       "питання з фото": [
//           "https://drive.google.com/open?id=1TxpxBVqm2AyqxXP9O3-X2x6UvoxkIVuz, https://drive.google.com/open?id=10dSfUqWWLR8T_5uNYMFgFftesEy3psgA"
//       ]
//   },
//   "range": {
//       "columnEnd": 5,
//       "columnStart": 1,
//       "rowEnd": 14,
//       "rowStart": 14
//   },
// }

export const onSubmit = async (e) => {
  try {
    const responseSheet = e.range.getSheet();
    const spreadSheet = responseSheet.getParent();

    const spreadSheetInfo = {
      spreadSheetId: spreadSheet.getId(),
      sheetId: `${responseSheet.getSheetId()}`,
    };
    const { data: spreadSheetConfiguration, error } =
      getSpreadSheetConfiguration(spreadSheetInfo);
    if (error) {
      Logger.log(error.message);
      return;
    }

    const nonFlattenPromises = Object.entries(
      spreadSheetConfiguration.columnToTgChatsMapping
    ).map(([colName, chats]) => {
      const newFilesUrls = e.namedValues[colName][0].split(', ');
      const newFilesIds = newFilesUrls.map((url) => url.split('id=')[1]);
      const newFilesBlobs = newFilesIds.map((id) =>
        DriveApp.getFileById(id).getBlob()
      );

      return chats.map((chat) =>
        sendFilesToTgChat(spreadSheetConfiguration.botInfo, chat, newFilesBlobs)
      );
    });

    const flattenSendFilesPromises = Array.prototype.concat.apply(
      [],
      nonFlattenPromises
    );

    const sendFilesResults = await Promise.allSettled(flattenSendFilesPromises);

    Logger.log(JSON.stringify(sendFilesResults));

    // DriveApp.getFileById(fileId).setTrashed(true);
  } catch (err) {
    Logger.log(err.message);
  }
};
