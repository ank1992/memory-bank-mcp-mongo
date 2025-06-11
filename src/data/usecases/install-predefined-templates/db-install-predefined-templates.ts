import { InstallPredefinedTemplates } from "../../../domain/usecases/project-templates.js";
import { ProjectTemplateRepository } from "../../protocols/project-template-repository.js";
import { ProjectTemplate } from "../../../domain/entities/project-template.js";

export class DbInstallPredefinedTemplates implements InstallPredefinedTemplates {
  constructor(
    private readonly projectTemplateRepository: ProjectTemplateRepository
  ) {}

  async execute(): Promise<{
    installed: ProjectTemplate[];
    errors: Array<{
      templateName: string;
      error: string;
    }>;
  }> {
    const predefinedTemplates = this.getPredefinedTemplates();
    const installed: ProjectTemplate[] = [];
    const errors: Array<{ templateName: string; error: string }> = [];

    for (const template of predefinedTemplates) {
      try {
        // Check if template already exists
        const existing = await this.projectTemplateRepository.getByName(template.name);
        if (existing) {
          continue; // Skip if already exists
        }

        const createdTemplate = await this.projectTemplateRepository.create(template);
        installed.push(createdTemplate);
      } catch (error) {
        errors.push({
          templateName: template.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { installed, errors };
  }

  private getPredefinedTemplates(): Array<Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>> {
    return [
      {
        name: "Simple Note Project",
        description: "A basic project template for note-taking with a README and initial note file",
        category: "documentation",
        version: "1.0.0",
        author: "Memory Bank",
        tags: ["notes", "documentation", "basic"],
        files: [
          {
            path: "README.md",
            content: `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Notes

This project was created on {{DATE}} using the Simple Note Project template.

## Files

- \`notes.md\` - Main notes file
- \`README.md\` - This file`,
            isVariable: true,
            description: "Project README file"
          },
          {
            path: "notes.md",
            content: `# Notes for {{PROJECT_NAME}}

Created: {{DATE}}

## Today's Notes

Add your notes here...

## Ideas

- 
- 
- 

## Tasks

- [ ] 
- [ ] 
- [ ] `,
            isVariable: true,
            description: "Main notes file"
          }
        ],
        variables: [
          {
            name: "PROJECT_NAME",
            description: "Name of the project",
            required: true,
            type: "string"
          },
          {
            name: "PROJECT_DESCRIPTION",
            description: "Brief description of the project",
            defaultValue: "A collection of notes and ideas",
            required: false,
            type: "string"
          }
        ]
      },
      {
        name: "Daily Journal",
        description: "Template for daily journaling with structured entries",
        category: "documentation",
        version: "1.0.0",
        author: "Memory Bank",
        tags: ["journal", "daily", "personal"],
        files: [
          {
            path: "README.md",
            content: `# {{JOURNAL_NAME}}

A daily journal started on {{DATE}}.

## Structure

- Each day gets its own entry in the main journal file
- Use the template structure for consistency
- Review weekly and monthly for insights`,
            isVariable: true,
            description: "Journal README"
          },
          {
            path: "journal.md",
            content: `# {{JOURNAL_NAME}}

## {{DATE}}

### Morning Reflection
*What am I grateful for today?*


### Daily Goals
- [ ] 
- [ ] 
- [ ] 

### Notes & Observations


### Evening Reflection
*What went well today? What could be improved?*


---

`,
            isVariable: true,
            description: "Main journal file"
          }
        ],
        variables: [
          {
            name: "JOURNAL_NAME",
            description: "Name for your journal",
            defaultValue: "My Daily Journal",
            required: false,
            type: "string"
          }
        ]
      },
      {
        name: "Project Planning",
        description: "Template for project planning with tasks, timeline, and documentation",
        category: "project-management",
        version: "1.0.0",
        author: "Memory Bank",
        tags: ["planning", "project", "management", "tasks"],
        files: [
          {
            path: "README.md",
            content: `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

**Start Date:** {{DATE}}  
**Project Lead:** {{PROJECT_LEAD}}

## Quick Links

- [Project Overview](project-overview.md)
- [Tasks & Timeline](tasks.md)
- [Meeting Notes](meetings.md)

## Status

🟡 Planning Phase`,
            isVariable: true,
            description: "Project README"
          },
          {
            path: "project-overview.md",
            content: `# {{PROJECT_NAME}} - Project Overview

## Objective

{{PROJECT_DESCRIPTION}}

## Success Criteria

- [ ] 
- [ ] 
- [ ] 

## Stakeholders

- **Project Lead:** {{PROJECT_LEAD}}
- **Team Members:** 
- **Stakeholders:** 

## Timeline

**Start:** {{DATE}}  
**Target Completion:** 

## Resources

### Required
- 
- 

### Available
- 
- 

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
|      |        |             |            |

## Notes

`,
            isVariable: true,
            description: "Detailed project overview"
          },
          {
            path: "tasks.md",
            content: `# {{PROJECT_NAME}} - Tasks & Timeline

## Current Sprint

### In Progress
- [ ] 

### To Do
- [ ] 
- [ ] 
- [ ] 

### Done
- [x] Project setup ({{DATE}})

## Backlog

- [ ] 
- [ ] 
- [ ] 

## Timeline

### Phase 1: Planning
- [x] Create project structure
- [ ] Define requirements
- [ ] Set timeline

### Phase 2: Execution
- [ ] 
- [ ] 

### Phase 3: Review
- [ ] Testing
- [ ] Documentation
- [ ] Retrospective`,
            isVariable: true,
            description: "Tasks and timeline tracking"
          },
          {
            path: "meetings.md",
            content: `# {{PROJECT_NAME}} - Meeting Notes

## {{DATE}} - Project Kickoff

**Attendees:** {{PROJECT_LEAD}}

**Agenda:**
1. Project overview
2. Timeline discussion
3. Resource allocation
4. Next steps

**Notes:**
- Project created using Memory Bank template
- Initial structure established

**Action Items:**
- [ ] 

---

## Template for Future Meetings

**Date:**  
**Attendees:**  

**Agenda:**
1. 
2. 
3. 

**Notes:**


**Action Items:**
- [ ] 

---`,
            isVariable: true,
            description: "Meeting notes and minutes"
          }
        ],
        variables: [
          {
            name: "PROJECT_NAME",
            description: "Name of the project",
            required: true,
            type: "string"
          },
          {
            name: "PROJECT_DESCRIPTION",
            description: "Brief description of what the project aims to achieve",
            required: true,
            type: "string"
          },
          {
            name: "PROJECT_LEAD",
            description: "Name of the project lead/manager",
            defaultValue: "TBD",
            required: false,
            type: "string"
          }
        ]
      }
    ];
  }
}
