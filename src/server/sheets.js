/* eslint-disable no-restricted-syntax */
import Mustache from 'mustache';
import { deleteFormFilesFromGDrive } from './drive';
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

function convertNumToCharIndex(num) {
  return String.fromCharCode((num % 26) + 'A'.charCodeAt(0));
}

const patchNotificationMsg = (notificationMsg, substituteValues) => {
  /**
   * examples:
   * notificationMsg - It is message from {A}, it found {B} items
   * substituteValues - ['John', '10']
   */

  if (!notificationMsg.includes('{{')) {
    return notificationMsg;
  }

  const substituteNames = new Array(substituteValues.length)
    .fill(0)
    .map((_, idx) => convertNumToCharIndex(idx));

  const view = substituteNames.reduce((acc, curr, idx) => {
    acc[curr] = substituteValues[idx];

    return acc;
  }, {});

  const output = Mustache.render(notificationMsg, view);

  return output;
};

/**
 * Steps:
 * - get spreadSheet + sheet info using onSubmit event
 * - get spreadSheetConfiguration using spreadSheet + sheet
 * - get mappings - what field put in what chat - using spreadSheetConfiguration
 * - for each field from mapping:
 * -     for each chat from the field's mapping:
 * -         send files that are stored in onSubmit event by field's name to chat
 * -     delete files from gdrive
 */
export const onSubmit = async (e) => {
  const PROCESSING_STATUSES = {
    START: 'START',
    CONFIGURATION_IS_FETCHED: 'CONFIGURATION_IS_FETCHED',
  };
  try {
    const processingStatus = {
      stepFinished: PROCESSING_STATUSES.START,
      errorMsg: undefined,
    };
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
      processingStatus.errorMsg = error.message;
      return;
    }
    processingStatus.stepFinished =
      PROCESSING_STATUSES.CONFIGURATION_IS_FETCHED;

    const columnToTgChatsMappingsGroupedByCol =
      spreadSheetConfiguration.columnToTgChatsMappings.reduce((acc, curr) => {
        if (!acc[curr.columnName]) {
          acc[curr.columnName] = [curr];
        } else {
          acc[curr.columnName].push(curr);
        }

        return acc;
      }, {});

    Logger.log(columnToTgChatsMappingsGroupedByCol);

    const sendFilesResults = await Promise.allSettled(
      Object.entries(columnToTgChatsMappingsGroupedByCol).map(
        async ([columnName, mappings]) => {
          const newFilesUrls = e.namedValues[columnName][0].split(', ');
          if (newFilesUrls.length === 0) {
            return null;
          }
          const newFilesIds = newFilesUrls.map((url) => url.split('id=')[1]);
          const newFilesBlobs = newFilesIds.map((id) =>
            DriveApp.getFileById(id).getBlob()
          );

          const sendFilesResultsForCol = await Promise.allSettled(
            mappings.map((mapping) => {
              return sendFilesToTgChat({
                botInfo: spreadSheetConfiguration.botInfo,
                chat: mapping.chat,
                filesBlobs: newFilesBlobs,
                notificationMsg: patchNotificationMsg(
                  mapping.notificationMsg,
                  e.values
                ),
              });
            })
          );
          deleteFormFilesFromGDrive(newFilesIds);

          return sendFilesResultsForCol;
        }
      )
    );

    const flattenSendFilesResults = Array.prototype.concat.apply(
      [],
      sendFilesResults
    );

    Logger.log(JSON.stringify(JSON.stringify(sendFilesResults)));
    Logger.log(JSON.stringify(JSON.stringify(flattenSendFilesResults)));
  } catch (err) {
    Logger.log(err.message);
  }
};
