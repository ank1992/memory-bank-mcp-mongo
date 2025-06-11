import { vi } from "vitest";
import { ContextChecker, ProjectContext } from "../../../src/presentation/helpers/context-checker.js";

export const makeContextChecker = (): ContextChecker => {
  const contextChecker = new ContextChecker(
    {} as any, // listProjectsUseCase mock
    {} as any, // listProjectFilesUseCase mock
    {} as any  // readFileUseCase mock
  );

  // Mock the methods with dynamic responses based on the input
  vi.spyOn(contextChecker, 'checkProjectContext').mockImplementation(async (projectName, fileName) => {
    const projectExists = projectName === "project-1" || projectName === "project-2";
    const fileExists = (projectName === "project-1" && (fileName === "file1.md" || fileName === "file2.md")) ||
                      (projectName === "project-2" && fileName === "fileA.md");
    
    return {
      currentProject: projectName,
      availableProjects: ["project-1", "project-2"],
      projectFiles: projectName === "project-1" ? ["file1.md", "file2.md"] : ["fileA.md"],
      suggestedFileName: "test-file.md",
      existingContent: fileExists ? "existing content" : undefined,
      projectExists,
      fileExists,
    };
  });
  
  vi.spyOn(contextChecker, 'formatContextInfo').mockReturnValue("Mock context info");
  vi.spyOn(contextChecker, 'generateRecommendation').mockReturnValue("Mock recommendation");

  return contextChecker;
};
