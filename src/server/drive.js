export const deleteFormFilesFromGDrive = (fileIds) => {
  /**
   * When a file is attached during form filling, it is automatically uploaded to the root folder of Google Drive.
   * Then, during form submission, the file is copied to the form's files folder.
   * Therefore, the file should be deleted from two places.
   */

  const extractFileOriginalName = (copyName) => {
    /**
     * examples:
     * - copyName - 'ABCD - John Doe.jpg'
     * - originalName - 'ABCD.jpg'
     */
    const regexPattern = /(.*) - .*?\.(.*)/;
    const match = regexPattern.exec(copyName);
    const originalName = `${match[1]}.${match[2]}`;

    return originalName;
  };
  const findOriginalFile = (copyFile) => {
    const copyFileName = copyFile.getName();
    const originalFileName = extractFileOriginalName(copyFileName);
    const originalFilesIterator =
      DriveApp.getRootFolder().getFilesByName(originalFileName);

    const originalFiles = [];
    while (originalFilesIterator.hasNext()) {
      originalFiles.push(originalFilesIterator.next());
    }
    Logger.log({
      originalFileName,
      originalFileNamesCount: originalFiles.length,
    });
    const filteredOriginalFiles = originalFiles.filter(
      (file) =>
        copyFile.getSize() === file.getSize() &&
        copyFile.getMimeType() === file.getMimeType() &&
        copyFile.getOwner().getName() === file.getOwner().getName() &&
        copyFile.getOwner().getEmail() === file.getOwner().getEmail() &&
        copyFile.getDateCreated().getTime() >= file.getDateCreated().getTime()
    );

    let originalFile = filteredOriginalFiles.shift();
    if (filteredOriginalFiles.length === 0) {
      return originalFile;
    }
    const copyFileCreatedAt = copyFile.getDateCreated().getTime();
    let minCreationTimeDiff =
      copyFileCreatedAt - originalFile.getDateCreated().getTime();
    filteredOriginalFiles.forEach((file) => {
      const creationTimeDiff =
        copyFileCreatedAt - file.getDateCreated().getTime();
      if (creationTimeDiff < minCreationTimeDiff) {
        originalFile = file;
        minCreationTimeDiff = creationTimeDiff;
      }
    });

    return originalFile;
  };

  const deleteFileUsingGDriveApi = (fileId) => {
    try {
      Drive.Files.remove(fileId);
    } catch (err) {
      if (
        err.name === 'GoogleJsonResponseException' &&
        err.message.includes('File not found')
      ) {
        // do nothing;
      } else {
        throw err;
      }
    }
  };

  const deleteFormFileFromGDrive = (fileId) => {
    const copyFile = DriveApp.getFileById(fileId);
    const originalFile = findOriginalFile(copyFile);

    deleteFileUsingGDriveApi(copyFile.getId());
    if (originalFile) {
      deleteFileUsingGDriveApi(originalFile.getId());
    }
  };

  fileIds.forEach(deleteFormFileFromGDrive);
};
