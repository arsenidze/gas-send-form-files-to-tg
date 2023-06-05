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

export const updateAvailableTelegramChats = (botInfo) => {
  try {
    const url = `${config.TELEGRAM_API_BASE_URL}${botInfo.token}/getUpdates`;
    const response = UrlFetchApp.fetch(url);
    const { ok, result: updates } = JSON.parse(response.getContentText());
    if (!ok) {
      return { data: undefined, error: 'Telegram Api error(getUpdates)' };
    }

    const availableChatsDict = botInfo.availableChatsDict || {};

    // eslint-disable-next-line no-restricted-syntax
    for (const update of updates) {
      if (!update.message && !update.my_chat_member) {
        // eslint-disable-next-line no-continue
        continue;
      }
      let chat;
      if (update.message) {
        chat = update.message.chat;
      } else {
        chat = update.my_chat_member.chat;
      }
      availableChatsDict[chat.id] = {
        id: chat.id,
        type: chat.type,
        title: chat.title || null,
        username: chat.username || null,
        display_label: chat.title || chat.username || chat.id,
      };
    }
    const lastUpdateId =
      updates.length > 0 ? updates[updates.length - 1].update_id : undefined;

    const newBotInfo = {
      ...botInfo,
      availableChatsDict,
      lastUpdateId,
    };

    return { data: newBotInfo, error: undefined };
  } catch (err) {
    Logger.log(err.message);
    return { data: undefined, error: err.message };
  }
};

export const sendFilesToTgChat = async (botInfo, chat, newFilesBlobs) => {
  try {
    const url = `${config.TELEGRAM_API_BASE_URL}${botInfo.token}/sendMediaGroup`;
    const formData = {
      chat_id: `${chat.id}`,
      media: JSON.stringify(
        newFilesBlobs.map((_, idx) => ({
          type: 'photo',
          media: `attach://photo${idx + 1}`,
        }))
      ),
      ...newFilesBlobs.reduce((acc, curr, idx) => {
        acc[`photo${idx + 1}`] = curr;

        return acc;
      }, {}),
    };

    Logger.log(JSON.stringify(Object.keys(formData)));

    const options = {
      method: 'POST',
      payload: formData,
    };
    const response = UrlFetchApp.fetch(url, options);
    const { ok, result } = JSON.parse(response.getContentText());
    if (!ok) {
      return { data: undefined, error: 'Telegram Api error(getUpdates)' };
    }

    return { data: result, error: undefined };
  } catch (err) {
    Logger.log(err.message);
    return { data: undefined, error: err.message };
  }
};
