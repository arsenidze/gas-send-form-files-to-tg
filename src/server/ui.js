export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('Помічник') // edit me!
    .addItem('Налаштувати форму', 'openDialogBootstrap');

  menu.addToUi();
};

export const openDialogBootstrap = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo-bootstrap')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor (Bootstrap)');
};

export const doGet = () => {
  return HtmlService.createHtmlOutputFromFile('dialog-demo-bootstrap');
};
