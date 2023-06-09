import { useEffect, useMemo, useState } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  const isBotConfigurationDisabled = useMemo(() => !isLoaded, [isLoaded]);
  const isColMappingDisabled = useMemo(
    () => !isLoaded || !spreadSheetConfiguration?.botInfo?.token,
    [isLoaded, spreadSheetConfiguration]
  );

  const fetchSpreadSheetConfiguration = async () => {
    console.log({
      spreadSheetId,
      sheetId,
    });
    try {
      const { data: spreadSheetConfigurationFromStorage, error } =
        await serverFunctions.getSpreadSheetConfiguration({
          spreadSheetId,
          sheetId,
        });
      console.log({
        spreadSheetConfigurationFromStorage,
        error,
      });
      if (error) {
        setApiErrorMsg(error);
        return;
      }

      setSpreadSheetConfiguration(spreadSheetConfigurationFromStorage);
      setIsLoaded(true);
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

  const setNewColumnToTgChatsMappings = async (newColumnToTgChatsMappings) => {
    const newSsConfiguration = {
      ...spreadSheetConfiguration,
      columnToTgChatsMappings: newColumnToTgChatsMappings,
    };
    await serverFunctions.setSpreadSheetConfiguration(newSsConfiguration);
    // configuration from storage is received since during mappings update
    // new values can be added to the configuration object and therefore should be loaded to client
    const { data: newSsConfigurationFromStorage, error } =
      await serverFunctions.getSpreadSheetConfiguration({
        spreadSheetId,
        sheetId,
      });
    if (error) {
      setApiErrorMsg(error.message);
      return;
    }
    setSpreadSheetConfiguration(newSsConfigurationFromStorage);
  };

  return (
    <div>
      {!!apiErrorMsg && apiErrorMsg}

      <div className="d-grid gap-3">
        <Button
          disabled={isBotConfigurationDisabled}
          onClick={openConfigureBotModal}
        >
          {config.ACTION_MSG.CONFIGURE_BOT}
        </Button>
        <Button
          disabled={isColMappingDisabled}
          onClick={openConfigureColumnMappingModal}
        >
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
            botInfo={spreadSheetConfiguration.botInfo}
            spreadSheetInfo={spreadSheetConfiguration.spreadSheetInfo}
            columnToTgChatsMappings={
              spreadSheetConfiguration.columnToTgChatsMappings
            }
            setNewColumnToTgChatsMappings={setNewColumnToTgChatsMappings}
            setNewBotInfo={setNewBotInfo}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};
