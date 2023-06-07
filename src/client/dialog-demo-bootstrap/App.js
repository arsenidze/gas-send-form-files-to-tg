import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Stack } from 'react-bootstrap';
import { SpreadsheetsView } from './pages/SpreadsheetsView';
import { SpreadsheetConfiguration } from './pages/SpreadsheetConfiguration';

export const App = () => {
  return (
    <Stack gap={5} className="mx-auto p-3">
      <BrowserRouter>
        <Routes>
          <Route
            path="/spreadsheets/:spreadSheetId/sheets/:sheetId/configuration"
            element={<SpreadsheetConfiguration />}
          />
          <Route path="*" element={<SpreadsheetsView />} />
        </Routes>
      </BrowserRouter>
    </Stack>
  );
};
