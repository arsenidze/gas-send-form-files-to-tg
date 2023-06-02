import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SpreadsheetsView } from './pages/SpreadsheetsView';
import { SpreadsheetConfiguration } from './pages/SpreadsheetConfiguration';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/spreadsheets/:spreadSheetId/sheets/:sheetId/configuration"
          element={<SpreadsheetConfiguration />}
        />
        <Route path="*" element={<SpreadsheetsView />} />
      </Routes>
    </BrowserRouter>
  );
};
