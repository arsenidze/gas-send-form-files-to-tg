import { useEffect, useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { serverFunctions } from '../../utils/serverFunctions';

const config = {
  ACTION_MSG: {
    ADD_NEW_MAPPING: 'Додати',
    CHOOSE_COLUMN: 'Виберіть колонку',
    CHOOSE_CHAT: 'Виберіть чат',
  },
  LABELS: {
    COLUMN_NAME: 'Колонка з таблиці',
    TG_CHAT_NAME: 'Телеграм канал',
    EXISTING_MAPPING: 'Існуючі відповідності: ',
    ADD_NEW_MAPPING: 'Додати нову відповідність',
  },
  ERROR_MSGS: {
    VALUE_IS_REQUIRED: 'Значення порожнє',
  },
};

export const ConfigureColumnMapping = ({
  botInfo,
  spreadSheetInfo,
  columnToTgChatsMapping,
  setNewColumnMapping,
  setNewBotInfo,
}) => {
  const [validated, setValidated] = useState(false);
  const [spreadSheetHeaders, setSpreadSheetHeaders] = useState([]);
  const [availableTelegramChats, setAvailableTelegramChats] = useState([]);
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

  // const getChatLabel = (chat) => {
  //   return chat.title || chat.username || chat.id;
  // };

  const addNewMapping = async () => {
    const newColumnToTgChatsMapping = { ...columnToTgChatsMapping };
    const chat = availableTelegramChats.find(
      (c) => c.display_label === chatName
    );
    if (!newColumnToTgChatsMapping[columnName]) {
      newColumnToTgChatsMapping[columnName] = [chat];
    } else {
      if (
        newColumnToTgChatsMapping[columnName].find(
          (c) => c.display_label === chatName
        )
      ) {
        return;
      }
      newColumnToTgChatsMapping[columnName] = [
        ...newColumnToTgChatsMapping[columnName],
        chat,
      ];
    }
    console.log(newColumnToTgChatsMapping);
    await setNewColumnMapping(newColumnToTgChatsMapping);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    console.log({
      columnName,
      chatName,
    });

    if (form.checkValidity()) {
      console.log('Form is valid');
      await addNewMapping();
      setValidated(false);
      setColumnName('');
      setChatName('');
    } else {
      console.log('Form is invalid');
      setValidated(true);
    }
  };

  return (
    <div>
      {!!apiErrorMsg && apiErrorMsg}

      <h6>{config.LABELS.EXISTING_MAPPING}</h6>
      <ListGroup className="mb-3">
        {Object.entries(columnToTgChatsMapping).map(([col, chats], idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-start align-items-center"
          >
            <span>
              {col}&nbsp;&nbsp;{'->'}&nbsp;&nbsp;
            </span>
            {chats.map((chat, i) => [
              i > 0 && <span>{', '}&nbsp;</span>,
              <span key={i}>{chat.display_label}</span>,
            ])}
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

        <Button variant="primary" type="submit">
          {config.ACTION_MSG.ADD_NEW_MAPPING}
        </Button>
      </Form>
    </div>
  );
};
