const config = {
  TELEGRAM_API_BASE_URL: 'https://api.telegram.org/bot',
};

export const getBotInfo = (botToken) => {
  try {
    const url = `${config.TELEGRAM_API_BASE_URL}${botToken}/getMe`;
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    return { data, error: undefined };
  } catch (err) {
    Logger.log(err.message);
    return { data: undefined, error: err.message };
  }
};
