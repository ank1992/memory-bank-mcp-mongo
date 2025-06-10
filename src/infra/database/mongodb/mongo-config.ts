// Structure MongoDB optimisée pour Memory Bank MCP

export interface MongoMemoryBankConfig {
  // Collections principales
  collections: {
    projects: 'memory_projects',
    files: 'memory_files',
    // Collection pour recherche full-text
    search_index: 'memory_search'
  },
  
  // Index pour performance
  indexes: {
    projects: [
      { name: 1 }, // unique
      { updatedAt: -1 },
      { 'metadata.tags': 1 }
    ],
    files: [
      { projectName: 1, name: 1 }, // unique compound
      { projectName: 1, updatedAt: -1 },
      { contentHash: 1 },
      { 'metadata.mimeType': 1 },
      // Index full-text sur le contenu
      { content: 'text', name: 'text' }
    ]
  }
}

// Schémas pour validation
export interface MongoFile {
  _id?: string;
  id: string;
  name: string;
  content: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  checksum: string;
  metadata: {
    encoding: string;
    mimeType: string;
    tags?: string[];
    version?: number;
    // Métadonnées spécifiques au contenu
    wordCount?: number;
    lineCount?: number;
    // Métadonnées de recherche
    keywords?: string[];
    summary?: string;
  };
}

export interface MongoProject {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  fileCount: number;
  totalSize: number;
  metadata: {
    tags?: string[];
    owner?: string;
    version?: string;
    // Statistiques avancées
    lastFileAdded?: Date;
    mostUsedMimeType?: string;
    // Recherche et indexation
    searchEnabled: boolean;
    lastIndexed?: Date;
  };
}
