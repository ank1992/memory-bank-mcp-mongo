export interface DeleteFileParams {
  projectName: string;
  filePath: string;
}

export interface DeleteFile {
  execute(params: DeleteFileParams): Promise<boolean>;
}
