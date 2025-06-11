export interface DeleteProjectParams {
  name: string;
}

export interface DeleteProject {
  execute(params: DeleteProjectParams): Promise<boolean>;
}
