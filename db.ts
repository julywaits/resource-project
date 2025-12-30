
import Dexie, { Table } from 'dexie';
import { Project, ProjectFile } from './types';

export class ProjectDatabase extends Dexie {
  projects!: Table<Project>;
  files!: Table<ProjectFile>;

  constructor() {
    super('ProjectManagementDB');
    // Version bumped to 3 to accommodate the new index
    (this as any).version(3).stores({
      projects: 'id, recordType, name, status, industry, updatedAt',
      files: 'id, projectId, name'
    });
  }
}

export const db = new ProjectDatabase();
