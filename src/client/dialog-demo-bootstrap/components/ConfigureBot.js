import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Form } from 'react-router-dom';
import { serverFunctions } from '../../utils/serverFunctions';

const config = {
  LABELS: {
    BOT_TOKEN: 'Токен бота',
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
  const [botToken, setBotToken] = useState(botInfo.token);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (botToken.trim() === '') {
      setErrorMsg(config.ERROR_MSGS.VALUE_IS_EMPTY);
      return;
    }

    try {
      const { data, error } = await serverFunctions.getBotInfo(botToken);
      if (error) {
        setErrorMsg(error);
      }

      setNewBotInfo(data);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div>
      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{config.LABELS.BOT_TOKEN}</Form.Label>
          <Form.Control
            type="text"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            isInvalid={!!errorMsg}
          />
          <Form.Text className="text-muted">
            {config.TEXTS.TOKEN_IS_NOT_USED}
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {errorMsg}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit">
          {config.ACTION_MSG.ADD_TOKEN}
        </Button>
      </Form>

      {!!botInfo.token && (
        <div>
          <pre>{JSON.stringify(botInfo)}</pre>
        </div>
      )}
    </div>
  );
};
