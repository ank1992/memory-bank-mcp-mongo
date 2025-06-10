import {
  FileRepository,
  ProjectRepository,
  MergeFilesParams,
  MergeFilesUseCase,
} from "./merge-files-protocols.js";

export class MergeFiles implements MergeFilesUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly projectRepository: ProjectRepository
  ) {}  async mergeFiles(params: MergeFilesParams): Promise<import("../../../domain/usecases/merge-files.js").MergeFilesResult | null> {
    const { projectName, includeMetadata = true, format = 'markdown' } = params;

    // Vérifier que le projet existe
    const projectExists = await this.projectRepository.projectExists(projectName);
    if (!projectExists) {
      return null;
    }

    // Récupérer tous les fichiers du projet
    const files = await this.fileRepository.listFiles(projectName);
    if (files.length === 0) {
      return null;
    }

    // Générer le contenu fusionné
    const mergedContent = this.generateMergedContent(files, includeMetadata, format);
    
    // Créer le nom du fichier merged
    const mergedFileName = `merged-${projectName}-${new Date().toISOString().split('T')[0]}.${format === 'markdown' ? 'md' : 'txt'}`;
    
    // Sauvegarder le fichier merged
    const mergedFile = await this.fileRepository.writeFile(projectName, mergedFileName, mergedContent);
    
    if (!mergedFile) {
      return null;
    }

    // Supprimer tous les fichiers originaux (sauf le fichier merged qu'on vient de créer)
    const filesToDelete = files.filter(file => file.name !== mergedFileName);
    const deletionResults: Array<{ fileName: string; success: boolean; error?: string }> = [];
    
    for (const file of filesToDelete) {
      try {
        const deleted = await this.fileRepository.deleteFile(projectName, file.name);
        deletionResults.push({ fileName: file.name, success: deleted });
      } catch (error) {
        deletionResults.push({ 
          fileName: file.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Retourner le résultat structuré
    return {
      content: mergedContent,
      format,
      fileCount: files.length,
      projectName,
      mergedFileName,
      deletedFiles: deletionResults.filter(r => r.success).map(r => r.fileName),
      failedDeletions: deletionResults.filter(r => !r.success)
    };
  }

  private generateMergedContent(files: any[], includeMetadata: boolean, format: 'markdown' | 'plain'): string {
    const isMarkdown = format === 'markdown';
    let content = '';

    // En-tête du document fusionné
    if (isMarkdown) {
      content += `# 📋 Project Summary - Merged Files\n\n`;
      content += `> **Generated on:** ${new Date().toISOString()}\n`;
      content += `> **Total files:** ${files.length}\n`;
      content += `> **Total size:** ${files.reduce((sum, f) => sum + f.size, 0)} bytes\n\n`;
    } else {
      content += `PROJECT SUMMARY - MERGED FILES\n`;
      content += `Generated on: ${new Date().toISOString()}\n`;
      content += `Total files: ${files.length}\n`;
      content += `Total size: ${files.reduce((sum, f) => sum + f.size, 0)} bytes\n\n`;
    }

    // Table des matières
    if (isMarkdown) {
      content += `## 📑 Table of Contents\n\n`;
      files.forEach((file, index) => {
        content += `${index + 1}. [${file.name}](#${file.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()})\n`;
      });
      content += `\n---\n\n`;
    }

    // Contenu de chaque fichier
    files.forEach((file, index) => {
      if (isMarkdown) {
        content += `## ${index + 1}. ${file.name}\n\n`;
        
        if (includeMetadata) {
          content += `**📄 File Metadata:**\n`;
          content += `- **Size:** ${file.size} bytes\n`;
          content += `- **Created:** ${file.createdAt.toISOString()}\n`;
          content += `- **Updated:** ${file.updatedAt.toISOString()}\n`;
          if (file.metadata?.mimeType) content += `- **Type:** ${file.metadata.mimeType}\n`;
          if (file.metadata?.wordCount) content += `- **Words:** ${file.metadata.wordCount}\n`;
          if (file.metadata?.lineCount) content += `- **Lines:** ${file.metadata.lineCount}\n`;
          if (file.metadata?.keywords?.length) content += `- **Keywords:** ${file.metadata.keywords.join(', ')}\n`;
          if (file.checksum) content += `- **Checksum:** \`${file.checksum}\`\n`;
          content += `\n`;
        }

        content += `**📝 Content:**\n\n`;
        content += '```\n';
        content += file.content;
        content += '\n```\n\n';
      } else {
        content += `========================================\n`;
        content += `FILE: ${file.name}\n`;
        content += `========================================\n`;
        
        if (includeMetadata) {
          content += `Size: ${file.size} bytes\n`;
          content += `Created: ${file.createdAt.toISOString()}\n`;
          content += `Updated: ${file.updatedAt.toISOString()}\n`;
          if (file.metadata?.wordCount) content += `Words: ${file.metadata.wordCount}\n`;
          if (file.metadata?.lineCount) content += `Lines: ${file.metadata.lineCount}\n`;
          content += `\n`;
        }

        content += `CONTENT:\n`;
        content += `${file.content}\n\n`;
      }
    });

    // Statistiques finales
    if (isMarkdown) {
      content += `---\n\n## 📊 Summary Statistics\n\n`;
      const totalWords = files.reduce((sum, f) => sum + (f.metadata?.wordCount || 0), 0);
      const totalLines = files.reduce((sum, f) => sum + (f.metadata?.lineCount || 0), 0);
      const allKeywords = files.flatMap(f => f.metadata?.keywords || []);
      const uniqueKeywords = [...new Set(allKeywords)];

      content += `- **📁 Total files:** ${files.length}\n`;
      content += `- **📏 Total size:** ${files.reduce((sum, f) => sum + f.size, 0)} bytes\n`;
      content += `- **📝 Total words:** ${totalWords}\n`;
      content += `- **📄 Total lines:** ${totalLines}\n`;
      content += `- **🏷️ Unique keywords:** ${uniqueKeywords.length}\n`;
      
      if (uniqueKeywords.length > 0) {
        content += `- **🔑 Most common keywords:** ${uniqueKeywords.slice(0, 10).join(', ')}\n`;
      }

      content += `\n---\n\n`;
      content += `*This merged document contains all files from the project for easy review.*\n`;
    } else {
      content += `========================================\n`;
      content += `SUMMARY STATISTICS\n`;
      content += `========================================\n`;
      content += `Total files: ${files.length}\n`;
      content += `Total size: ${files.reduce((sum, f) => sum + f.size, 0)} bytes\n`;
      content += `Generated: ${new Date().toISOString()}\n`;
    }

    return content;
  }
}
