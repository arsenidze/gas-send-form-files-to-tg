const config = {
  SPREADSHEET_CONFIGURATION: 'SPREADSHEET_CONFIGURATION',
  ACTIVE_SPREADSHEETS_KEY: 'ACTIVE_SPREADSHEETS_KEY',
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
  try {
    const properties = PropertiesService.getScriptProperties();
    const configurationsAsStr = properties.getProperty(
      config.SPREADSHEET_CONFIGURATION
    );
    if (!configurationsAsStr) {
      return {
        data: {
          botInfo: {},
          spreadSheetInfo,
          columnToTgChatsMapping: {},
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

    return { data: spreadSheetConfiguration, error: undefined };
  } catch (err) {
    Logger.log(`Error in getSpreadSheetConfiguration: ${err.message}`);
    return { data: undefined, error: err };
  }
};

export const setSpreadSheetConfiguration = (spreadSheetConfiguration) => {
  try {
    const properties = PropertiesService.getScriptProperties();
    const configurationsAsStr = properties.getProperty(
      config.SPREADSHEET_CONFIGURATION
    );
    if (!configurationsAsStr) {
      properties.setProperty(
        config.SPREADSHEET_CONFIGURATION,
        JSON.stringify([spreadSheetConfiguration])
      );
    } else {
      const configurations = JSON.parse(configurationsAsStr);
      const newConfigurations = configurations.map((cfg) => {
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
      properties.setProperty(
        config.SPREADSHEET_CONFIGURATION,
        JSON.stringify(newConfigurations)
      );
    }

    return { data: true, error: undefined };
  } catch (err) {
    Logger.log(`Error in setSpreadSheetConfiguration: ${err.message}`);
    return { data: undefined, error: err };
  }
};
