import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { serverFunctions } from '../../utils/serverFunctions';
import { ConfigureBot } from '../components/ConfigureBot';
import { ConfigureColumnMapping } from '../components/ConfigureColumnMapping';

const config = {
  ACTION_MSG: {
    CONFIGURE_BOT: 'Налаштувати бота',
    CONFIGURE_COLUMN_MAPPING: 'Налаштувати відповідність',
    GO_BACK: 'Назад',
  },
};

export const SpreadsheetConfiguration = () => {
  const navigate = useNavigate();
  const [spreadSheetConfiguration, setSpreadSheetConfiguration] = useState({});
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [showConfigureBotModal, setShowConfigureBotModal] = useState(false);
  const [showConfigureColumnMappingModal, setShowConfigureColumnMappingModal] =
    useState(false);
  const { spreadSheetId, sheetId } = useParams();

  const fetchSpreadSheetConfiguration = async () => {
    try {
      const { data: spreadSheetConfigurationFromStorage, error } =
        await serverFunctions.getSpreadSheetConfiguration({
          spreadSheetId,
          sheetId,
        });
      if (error) {
        setApiErrorMsg(error);
        return;
      }

      setSpreadSheetConfiguration(spreadSheetConfigurationFromStorage);
    } catch (err) {
      setApiErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchSpreadSheetConfiguration();
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  const openConfigureBotModal = () => {
    setShowConfigureBotModal(true);
  };

  const openConfigureColumnMappingModal = () => {
    setShowConfigureColumnMappingModal(true);
  };

  const handleCloseOfConfigureBotModal = () => {
    setShowConfigureBotModal(false);
  };

  const handleCloseOfConfigureColumnMappingModal = () => {
    setShowConfigureColumnMappingModal(false);
  };

  const setNewBotInfo = async (newBotInfo) => {
    const newSsConfiguration = {
      ...spreadSheetConfiguration,
      botInfo: newBotInfo,
    };
    await serverFunctions.setSpreadSheetConfiguration(newSsConfiguration);
    setSpreadSheetConfiguration(newSsConfiguration);
  };

  const setNewColumnMapping = async (newColumnToTgChatsMapping) => {
    const newSsConfiguration = {
      ...spreadSheetConfiguration,
      columnToTgChatsMapping: newColumnToTgChatsMapping,
    };
    await serverFunctions.setSpreadSheetConfiguration(newSsConfiguration);
    setSpreadSheetConfiguration(newSsConfiguration);
  };

  return (
    <div>
      {!!apiErrorMsg && apiErrorMsg}

      <div className="d-grid gap-3">
        <Button onClick={openConfigureBotModal}>
          {config.ACTION_MSG.CONFIGURE_BOT}
        </Button>
        <Button onClick={openConfigureColumnMappingModal}>
          {config.ACTION_MSG.CONFIGURE_COLUMN_MAPPING}
        </Button>
        <Button onClick={goBack}>{config.ACTION_MSG.GO_BACK}</Button>
      </div>

      <Modal
        show={showConfigureBotModal}
        onHide={handleCloseOfConfigureBotModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>{config.ACTION_MSG.CONFIGURE_BOT}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ConfigureBot
            botInfo={spreadSheetConfiguration.botInfo}
            setNewBotInfo={setNewBotInfo}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showConfigureColumnMappingModal}
        onHide={handleCloseOfConfigureColumnMappingModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {config.ACTION_MSG.CONFIGURE_COLUMN_MAPPING}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ConfigureColumnMapping
            spreadSheetInfo={spreadSheetConfiguration.spreadSheetInfo}
            columnToTgChatsMapping={
              spreadSheetConfiguration.columnToTgChatsMapping
            }
            setNewColumnMapping={setNewColumnMapping}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
