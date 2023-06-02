import { useEffect, useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { serverFunctions } from '../../utils/serverFunctions';

const config = {
  ACTION_MSG: {
    ADD_NEW_MAPPING: 'Додати',
  },
  LABELS: {
    COLUMN_NAME: 'Колонка з таблиці',
    TG_CHAT_NAME: 'Телеграм канал',
  },
  ERROR_MSGS: {
    VALUE_IS_REQUIRED: 'Значення порожнє',
  },
};

export const ConfigureColumnMapping = (
  spreadSheetInfo,
  columnToTgChatsMapping,
  setNewColumnMapping
) => {
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
      }
      setSpreadSheetHeaders(data);
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  const fetchAvailableTelegramChats = async () => {
    try {
      const { data, error } = await serverFunctions.getSpreadSheetHeaders(
        spreadSheetInfo
      );
      if (error) {
        setApiErrorMsg(error);
      }
      setAvailableTelegramChats(data);
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchSpreadSheetHeaders();
    fetchAvailableTelegramChats();
  }, []);

  const addNewMapping = async () => {
    const newColumnToTgChatsMapping = { ...columnToTgChatsMapping };
    if (!newColumnToTgChatsMapping[columnName]) {
      newColumnToTgChatsMapping[columnName] = [chatName];
    } else {
      newColumnToTgChatsMapping[columnName] = [
        ...newColumnToTgChatsMapping[columnName],
        chatName,
      ];
    }
    await setNewColumnMapping(newColumnToTgChatsMapping);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

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

      <ListGroup>
        {Object.entries(columnToTgChatsMapping).map(([col, chats], idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-start align-items-center"
          >
            <span>{`Колонка: ${col} -> `}</span>
            {chats.map((chat, i) => [
              i > 0 && ', ',
              <span key={i}>{chat}</span>,
            ])}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Form noValidate validated={validated} onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{config.LABELS.COLUMN_NAME}</Form.Label>
          <Form.Select
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            required
            aria-label="Select column"
          >
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
            {availableTelegramChats.map((value, idx) => (
              <option key={idx} value={value}>
                {value}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {config.ERROR_MSGS.VALUE_IS_REQUIRED}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit">
          {config.ACTION_MSG.ADD_TOKEN}
        </Button>
      </Form>
    </div>
  );
};
