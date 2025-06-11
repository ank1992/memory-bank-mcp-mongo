import { ProjectTemplate } from "../../domain/entities/project-template.js";

export interface ProjectTemplateRepository {
  // Create a new template
  create(template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectTemplate>;
  
  // Get all templates with optional filtering
  getAll(category?: string, tags?: string[]): Promise<ProjectTemplate[]>;
  
  // Get template by ID
  getById(templateId: string): Promise<ProjectTemplate | null>;
  
  // Get template by name
  getByName(name: string): Promise<ProjectTemplate | null>;
  
  // Update template
  update(templateId: string, updates: Partial<Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProjectTemplate | null>;
  
  // Delete template
  delete(templateId: string): Promise<boolean>;
  
  // Check if template exists
  exists(templateId: string): Promise<boolean>;
  
  // Get templates by category
  getByCategory(category: string): Promise<ProjectTemplate[]>;
  
  // Get templates by tags
  getByTags(tags: string[]): Promise<ProjectTemplate[]>;
}
