const config = {
  SPREADSHEET_CONFIGURATION: 'SPREADSHEET_CONFIGURATION',
  ACTIVE_SPREADSHEETS_KEY: 'ACTIVE_SPREADSHEETS_KEY',
  ON_SUBMIT_FUNCTION_NAME: 'onSubmit',
};

export const getActiveSpreadSheets = () => {
  try {
    const properties = PropertiesService.getScriptProperties();
    const activeSpreadSheetsAsStr = properties.getProperty(
      config.ACTIVE_SPREADSHEETS_KEY
    );
    if (!activeSpreadSheetsAsStr) {
      return {
        data: [],
        error: undefined,
      };
    }

    return { data: JSON.parse(activeSpreadSheetsAsStr), error: undefined };
  } catch (err) {
    Logger.log(`Error in getActiveSpreadSheets: ${err.message}`);
    return { data: undefined, error: err };
  }
};

export const setActiveSpreadSheets = (spreadSheets = []) => {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(
      config.ACTIVE_SPREADSHEETS_KEY,
      JSON.stringify(spreadSheets)
    );

    return { data: true, error: undefined };
  } catch (err) {
    Logger.log(`Error in setActiveSpreadSheets: ${err.message}`);
    return { data: undefined, error: err };
  }
};

export const getSpreadSheetConfiguration = (spreadSheetInfo) => {
  const defaultValues = {
    botInfo: {},
    columnToTgChatsMappings: [],
    onSubmitTrigger: {},
  };
  try {
    const properties = PropertiesService.getScriptProperties();
    const configurationsAsStr = properties.getProperty(
      config.SPREADSHEET_CONFIGURATION
    );
    if (!configurationsAsStr) {
      return {
        data: {
          ...defaultValues,
          spreadSheetInfo,
        },
        error: undefined,
      };
    }
    const configurations = JSON.parse(configurationsAsStr);
    const spreadSheetConfiguration = configurations.find(
      (cfg) =>
        cfg.spreadSheetInfo.spreadSheetId === spreadSheetInfo.spreadSheetId &&
        cfg.spreadSheetInfo.sheetId === spreadSheetInfo.sheetId
    );

    return {
      data: { ...defaultValues, ...spreadSheetConfiguration },
      error: undefined,
    };
  } catch (err) {
    Logger.log(`Error in getSpreadSheetConfiguration: ${err.message}`);
    return { data: undefined, error: err };
  }
};

const createOnSubmitTrigger = (spreadSheetConfiguration) => {
  Logger.log('createOnSubmitTrigger');
  const spreadSheet = SpreadsheetApp.openById(
    spreadSheetConfiguration.spreadSheetInfo.spreadSheetId
  );
  const trigger = ScriptApp.newTrigger(config.ON_SUBMIT_FUNCTION_NAME)
    .forSpreadsheet(spreadSheet)
    .onFormSubmit()
    .create();

  // eslint-disable-next-line no-param-reassign
  spreadSheetConfiguration.onSubmitTrigger = {
    uniqueId: trigger.getUniqueId(),
  };

  return trigger;
};

const deleteOnSubmitTrigger = (spreadSheetConfiguration) => {
  Logger.log('deleteOnSubmitTrigger');

  const allTriggers = ScriptApp.getProjectTriggers();
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < allTriggers.length; index++) {
    // If the current trigger is the correct one, delete it.
    if (
      allTriggers[index].getUniqueId() ===
      spreadSheetConfiguration.onSubmitTrigger.uniqueId
    ) {
      ScriptApp.deleteTrigger(allTriggers[index]);
      break;
    }
  }

  // eslint-disable-next-line no-param-reassign
  spreadSheetConfiguration.onSubmitTrigger = {};
};

export const setSpreadSheetConfiguration = (spreadSheetConfiguration) => {
  try {
    const properties = PropertiesService.getScriptProperties();
    const configurationsAsStr = properties.getProperty(
      config.SPREADSHEET_CONFIGURATION
    );

    let newConfigurations;
    if (!configurationsAsStr) {
      newConfigurations = [spreadSheetConfiguration];
    } else {
      const configurations = JSON.parse(configurationsAsStr);
      newConfigurations = configurations.map((cfg) => {
        if (
          cfg.spreadSheetInfo.spreadSheetId ===
            spreadSheetConfiguration.spreadSheetInfo.spreadSheetId &&
          cfg.spreadSheetInfo.sheetId ===
            spreadSheetConfiguration.spreadSheetInfo.sheetId
        ) {
          return spreadSheetConfiguration;
        }
        return cfg;
      });
    }

    const isOnSubmitTriggerAddRequired =
      spreadSheetConfiguration.columnToTgChatsMappings.length > 0 &&
      !spreadSheetConfiguration.onSubmitTrigger?.uniqueId;

    if (isOnSubmitTriggerAddRequired) {
      createOnSubmitTrigger(spreadSheetConfiguration);
    }

    const isOnSubmitTriggerDeleteRequired =
      spreadSheetConfiguration.columnToTgChatsMappings.length === 0 &&
      !!spreadSheetConfiguration.onSubmitTrigger.uniqueId;

    if (isOnSubmitTriggerDeleteRequired) {
      deleteOnSubmitTrigger(spreadSheetConfiguration);
    }

    Logger.log(JSON.stringify(newConfigurations));

    properties.setProperty(
      config.SPREADSHEET_CONFIGURATION,
      JSON.stringify(newConfigurations)
    );

    return { data: true, error: undefined };
  } catch (err) {
    Logger.log(`Error in setSpreadSheetConfiguration: ${err.message}`);
    return { data: undefined, error: err };
  }
};
