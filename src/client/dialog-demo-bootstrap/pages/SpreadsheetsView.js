import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Form, ListGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { serverFunctions } from '../../utils/serverFunctions';

const config = {
  ERROR_MSGS: {
    VALUE_IS_EMPTY: 'Значення порожнє',
    VALUE_ALREADY_EXISTS: 'Значення вже існує',
  },
  ACTION_MSGS: {
    REMOVE_VALUE: 'Видалити',
    ADD_VALUE: 'Додати',
    CONFIGURE: 'Налаштувати',
  },
};

export const SpreadsheetsView = () => {
  const [activeSpreadSheets, setActiveSpreadSheets] = useState([]);
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [newSheetUrl, setNewSheetUrl] = useState('');
  const [newSheetUrlError, setNewSheetUrlError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveSpreadSheets = async () => {
    try {
      const { data: activeSpreadSheetsFromStorage, error } =
        await serverFunctions.getActiveSpreadSheets();
      if (error) {
        setApiErrorMsg(error);
        return;
      }

      setActiveSpreadSheets(activeSpreadSheetsFromStorage);
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchActiveSpreadSheets();
  }, []);

  const addNewSpreadSheet = async (newSpreadSheet) => {
    const newActiveSpreadSheets = [...activeSpreadSheets, newSpreadSheet];
    await serverFunctions.setActiveSpreadSheets(newActiveSpreadSheets);
    setActiveSpreadSheets(newActiveSpreadSheets);
  };

  const removeSpreadSheet = async (spreadSheet) => {
    const newActiveSpreadSheets = activeSpreadSheets.filter(
      (ss) => ss.spreadSheetUrl !== spreadSheet.spreadSheetUrl
    );
    await serverFunctions.setActiveSpreadSheets(newActiveSpreadSheets);
    setActiveSpreadSheets(newActiveSpreadSheets);
  };

  const handleAddNewSpreadSheet = async () => {
    try {
      setNewSheetUrlError('');
      setApiErrorMsg('');
      if (newSheetUrl.trim() === '') {
        setNewSheetUrlError(config.ERROR_MSGS.VALUE_IS_EMPTY);
        return;
      }

      if (activeSpreadSheets.find((ss) => ss.spreadSheetUrl === newSheetUrl)) {
        setNewSheetUrlError(config.ERROR_MSGS.VALUE_ALREADY_EXISTS);
        return;
      }

      setIsLoading(true);
      const { data: ss, error } = await serverFunctions.getSpreadSheetInfo(
        newSheetUrl
      );
      setIsLoading(false);
      if (error) {
        setApiErrorMsg(error);
        return;
      }

      addNewSpreadSheet(ss);

      setNewSheetUrl('');
      setNewSheetUrlError('');
      setApiErrorMsg('');
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  return (
    <div>
      {!!apiErrorMsg && apiErrorMsg}
      <ListGroup>
        {activeSpreadSheets.map((spreadSheet, idx) => (
          <ListGroup.Item
            key={idx}
            className="d-flex justify-content-start align-items-center"
          >
            <a
              href={spreadSheet.spreadSheetUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                {spreadSheet.spreadSheetName} | {spreadSheet.sheetName}
              </span>
            </a>
            <ButtonGroup className="ms-auto">
              <Link
                to={`/spreadsheets/${spreadSheet.spreadSheetId}/sheets/${spreadSheet.sheetId}/configuration`}
              >
                <Button variant="info" size="sm">
                  {config.ACTION_MSGS.CONFIGURE}
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeSpreadSheet(spreadSheet)}
              >
                {config.ACTION_MSGS.REMOVE_VALUE}
              </Button>
            </ButtonGroup>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=..."
            value={newSheetUrl}
            onChange={(e) => setNewSheetUrl(e.target.value)}
            isInvalid={!!newSheetUrlError}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleAddNewSpreadSheet();
              }
            }}
          />
          <Form.Control.Feedback type="invalid">
            {newSheetUrlError}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="success" onClick={handleAddNewSpreadSheet}>
          {isLoading && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-1"
            />
          )}
          {config.ACTION_MSGS.ADD_VALUE}
        </Button>
      </Form>
    </div>
  );
};
