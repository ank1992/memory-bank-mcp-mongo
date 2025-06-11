import { CompareFileVersions } from "../../../domain/usecases/file-versioning.js";
import { FileVersionRepository } from "../../protocols/file-version-repository.js";

export class DbCompareFileVersions implements CompareFileVersions {
  constructor(
    private readonly fileVersionRepository: FileVersionRepository
  ) {}

  async execute(
    projectName: string, 
    fileName: string, 
    version1: number, 
    version2: number
  ): Promise<{
    version1Content: string;
    version2Content: string;
    differences: Array<{
      type: 'addition' | 'deletion' | 'modification';
      line: number;
      content: string;
    }>;
  } | null> {
    const [ver1, ver2] = await Promise.all([
      this.fileVersionRepository.getVersion(projectName, fileName, version1),
      this.fileVersionRepository.getVersion(projectName, fileName, version2)
    ]);

    if (!ver1 || !ver2) {
      return null;
    }

    // Simple line-by-line diff implementation
    const lines1 = ver1.content.split('\n');
    const lines2 = ver2.content.split('\n');
    const differences: Array<{
      type: 'addition' | 'deletion' | 'modification';
      line: number;
      content: string;
    }> = [];

    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];
      
      if (line1 === undefined) {
        differences.push({
          type: 'addition',
          line: i + 1,
          content: line2
        });
      } else if (line2 === undefined) {
        differences.push({
          type: 'deletion',
          line: i + 1,
          content: line1
        });
      } else if (line1 !== line2) {
        differences.push({
          type: 'modification',
          line: i + 1,
          content: `From: "${line1}" To: "${line2}"`
        });
      }
    }

    return {
      version1Content: ver1.content,
      version2Content: ver2.content,
      differences
    };
  }
}
