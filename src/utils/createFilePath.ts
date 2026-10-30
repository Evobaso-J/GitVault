/**
 * Joins the current folder path (from the route query) with a file or folder name.
 */
export const createFilePath = (queryPath: string | undefined, fileName: string): string =>
  queryPath ? `${queryPath}/${fileName}` : fileName
