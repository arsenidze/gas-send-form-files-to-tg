import { useEffect, useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { serverFunctions } from '../../utils/serverFunctions';

const config = {
  ACTION_MSG: {
    ADD_NEW_MAPPING: 'Додати',
    CHOOSE_COLUMN: 'Виберіть колонку',
    CHOOSE_CHAT: 'Виберіть чат',
    DELETE_MAPPING: 'Видалити',
  },
  LABELS: {
    COLUMN_NAME: 'Колонка з таблиці',
    TG_CHAT_NAME: 'Телеграм чат',
    NOTIFICATION_MSG: 'Текст повідомлення',
    EXISTING_MAPPING: 'Існуючі відповідності: ',
    ADD_NEW_MAPPING: 'Додати нову відповідність',
  },
  ERROR_MSGS: {
    VALUE_IS_REQUIRED: 'Значення порожнє',
    VALUES_ALREADY_EXISTS: 'Значення вже існує',
  },
};

export const ConfigureColumnMapping = ({
  botInfo,
  spreadSheetInfo,
  columnToTgChatsMappings,
  setNewColumnToTgChatsMappings,
  setNewBotInfo,
}) => {
  const [validated, setValidated] = useState(false);
  const [spreadSheetHeaders, setSpreadSheetHeaders] = useState([]);
  const [availableTelegramChats, setAvailableTelegramChats] = useState([]);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [columnName, setColumnName] = useState('');
  const [chatName, setChatName] = useState('');

  const fetchSpreadSheetHeaders = async () => {
    try {
      const { data, error } = await serverFunctions.getSpreadSheetHeaders(
        spreadSheetInfo
      );
      if (error) {
        setApiErrorMsg(error);
        return;
      }
      setSpreadSheetHeaders(data);
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  const fetchAvailableTelegramChats = async () => {
    try {
      const { data: newBotInfo, error } =
        await serverFunctions.updateAvailableTelegramChats(botInfo);
      console.log({
        newBotInfo,
        error,
      });
      if (error) {
        setApiErrorMsg(error);
        return;
      }
      await setNewBotInfo(newBotInfo);

      const availableChats = Object.values(newBotInfo.availableChatsDict);

      setAvailableTelegramChats(availableChats);
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchSpreadSheetHeaders();
    fetchAvailableTelegramChats();
  }, []);

  const addNewMapping = async () => {
    const chat = availableTelegramChats.find(
      (c) => c.display_label === chatName
    );
    const newMapping = {
      columnName,
      chat,
      notificationMsg,
    };

    if (
      columnToTgChatsMappings.find(
        (mapping) =>
          mapping.columnName === newMapping.columnName &&
          mapping.chat.display_label === newMapping.chat.display_label
      )
    ) {
      setApiErrorMsg(config.ERROR_MSGS.VALUES_ALREADY_EXISTS);
      return;
    }

    const newColumnToTgChatsMappings = [...columnToTgChatsMappings, newMapping];

    console.log(newColumnToTgChatsMappings);
    await setNewColumnToTgChatsMappings(newColumnToTgChatsMappings);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    console.log({
      columnName,
      chatName,
      notificationMsg,
    });

    if (form.checkValidity()) {
      console.log('Form is valid');
      await addNewMapping();
      setValidated(false);
      setColumnName('');
      setChatName('');
      setNotificationMsg('');
    } else {
      console.log('Form is invalid');
      setValidated(true);
    }
  };

  const deleteMapping = async (mapping) => {
    const newColumnToTgChatsMappings = columnToTgChatsMappings.filter(
      (m) => m !== mapping
    );
    await setNewColumnToTgChatsMappings(newColumnToTgChatsMappings);
  };

  return (
    <div>
      {!!apiErrorMsg && apiErrorMsg}

      <h6>{config.LABELS.EXISTING_MAPPING}</h6>
      <ListGroup className="mb-3">
        {columnToTgChatsMappings.map((mapping, idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-start align-items-center"
          >
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group className="mb-1">
                <Form.Label>{config.LABELS.COLUMN_NAME}</Form.Label>
                <Form.Control disabled type="text" value={mapping.columnName} />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>{config.LABELS.TG_CHAT_NAME}</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={mapping.chat.display_label}
                />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label>{config.LABELS.NOTIFICATION_MSG}</Form.Label>
                <Form.Control
                  as="textarea"
                  disabled
                  value={mapping.notificationMsg}
                />
              </Form.Group>
              <Button
                variant="danger"
                onClick={() => deleteMapping(mapping, idx)}
              >
                {config.ACTION_MSG.DELETE_MAPPING}
              </Button>
            </Form>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <h6>{config.LABELS.ADD_NEW_MAPPING}</h6>
      <Form noValidate validated={validated} onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{config.LABELS.COLUMN_NAME}</Form.Label>
          <Form.Select
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            required
            aria-label="Select column"
          >
            <option value="">{config.ACTION_MSG.CHOOSE_COLUMN}</option>
            {spreadSheetHeaders.map((value, idx) => (
              <option key={idx} value={value}>
                {value}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {config.ERROR_MSGS.VALUE_IS_REQUIRED}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{config.LABELS.TG_CHAT_NAME}</Form.Label>
          <Form.Select
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            required
            aria-label="Select chat"
          >
            <option value="">{config.ACTION_MSG.CHOOSE_CHAT}</option>
            {availableTelegramChats.map((chat, idx) => (
              <option key={idx} value={chat.display_label}>
                {chat.display_label}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {config.ERROR_MSGS.VALUE_IS_REQUIRED}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>{config.LABELS.NOTIFICATION_MSG}</Form.Label>
          <Form.Control
            type="text"
            value={notificationMsg}
            onChange={(e) => setNotificationMsg(e.target.value)}
            required
          />
          <Form.Control.Feedback type="invalid">
            {config.ERROR_MSGS.VALUE_IS_REQUIRED}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit">
          {config.ACTION_MSG.ADD_NEW_MAPPING}
        </Button>
      </Form>
    </div>
  );
};
