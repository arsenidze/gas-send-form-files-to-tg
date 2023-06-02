import { onOpen, openDialogBootstrap } from './ui';

import { getSpreadSheetInfo, getSpreadSheetHeaders } from './sheets';
import {
  getActiveSpreadSheets,
  setActiveSpreadSheets,
  getSpreadSheetConfiguration,
  setSpreadSheetConfiguration,
} from './storage';

import { getBotInfo } from './telegramBotApi';

// Public functions must be exported as named exports
export {
  onOpen,
  openDialogBootstrap,
  getSpreadSheetInfo,
  getSpreadSheetHeaders,
  getActiveSpreadSheets,
  setActiveSpreadSheets,
  getSpreadSheetConfiguration,
  setSpreadSheetConfiguration,
  getBotInfo,
};
