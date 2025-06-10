import { File } from "../entities/index.js";

export interface MergeFilesParams {
  projectName: string;
  outputFileName?: string; // Nom du fichier fusionné (optionnel, par défaut "merged-summary.md")
  includeMetadata?: boolean; // Inclure les métadonnées dans le résumé (par défaut true)
  format?: 'markdown' | 'plain'; // Format de sortie (par défaut 'markdown')
}

export interface MergeFilesResult {
  content: string;
  format: string;
  fileCount: number;
  projectName: string;
  mergedFileName: string;
  deletedFiles: string[];
  failedDeletions: Array<{ fileName: string; success: boolean; error?: string }>;
}

export interface MergeFilesUseCase {
  mergeFiles(params: MergeFilesParams): Promise<MergeFilesResult | null>;
}
