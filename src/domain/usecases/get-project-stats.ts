export interface GetProjectStatsParams {
  projectName: string;
}

export interface ProjectStats {
  fileCount: number;
  totalSize: number;
}

export interface GetProjectStats {
  execute(params: GetProjectStatsParams): Promise<ProjectStats>;
}
