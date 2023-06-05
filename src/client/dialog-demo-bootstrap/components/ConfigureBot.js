import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { serverFunctions } from '../../utils/serverFunctions';

const config = {
  LABELS: {
    BOT_TOKEN: 'Токен бота',
    BOT_USERNAME: 'Бот username',
    BOT_FIRST_NAME: 'Бот first name',
  },
  ACTION_MSG: {
    ADD_TOKEN: 'Додати',
  },
  TEXTS: {
    TOKEN_IS_NOT_USED:
      'Значення токену зберігається лише в налаштуваннях юзера та не використовується ніде окрім цього доповнення',
  },
  ERROR_MSGS: {
    VALUE_IS_EMPTY: 'Значення порожнє',
  },
};

export const ConfigureBot = ({ botInfo, setNewBotInfo }) => {
  const [botToken, setBotToken] = useState(botInfo.token || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const onSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');

    if (botToken.trim() === '') {
      setErrorMsg(config.ERROR_MSGS.VALUE_IS_EMPTY);
      return;
    }

    try {
      const { data: getMeResponse, error } = await serverFunctions.getBotInfo(
        botToken
      );
      console.log({
        getMeResponse,
        error,
      });
      if (error) {
        setErrorMsg(error);
        return;
      }

      setNewBotInfo({
        token: botToken,
        me: getMeResponse.result,
      });
      setIsButtonDisabled(true);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const onTokenInputChange = (e) => {
    setBotToken(e.target.value);
    setIsButtonDisabled(false);
  };

  return (
    <div>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{config.LABELS.BOT_TOKEN}</Form.Label>
          <Form.Control
            type="text"
            value={botToken}
            onChange={onTokenInputChange}
            isInvalid={!!errorMsg}
          />
          <Form.Text className="text-muted">
            {config.TEXTS.TOKEN_IS_NOT_USED}
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {errorMsg}
          </Form.Control.Feedback>
        </Form.Group>

        {!!botInfo.token && (
          <Form.Group className="mb-3">
            <Form.Label>{config.LABELS.BOT_USERNAME}</Form.Label>
            <Form.Control type="text" value={botInfo.me.username} disabled />
          </Form.Group>
        )}

        {!!botInfo.token && (
          <Form.Group className="mb-3">
            <Form.Label>{config.LABELS.BOT_FIRST_NAME}</Form.Label>
            <Form.Control type="text" value={botInfo.me.first_name} disabled />
          </Form.Group>
        )}

        <Button disabled={isButtonDisabled} variant="primary" type="submit">
          {config.ACTION_MSG.ADD_TOKEN}
        </Button>
      </Form>
    </div>
  );
};
