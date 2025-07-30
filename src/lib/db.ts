
import Dexie, { type Table } from 'dexie';

export interface StoredFile {
  id?: number;
  name: string;
  file: File;
  lastOpened: Date;
}

export class TandaiPDFDB extends Dexie {
  files!: Table<StoredFile>; 

  constructor() {
    super('TandaiPDFDatabase');
    this.version(1).stores({
      files: '++id, &name, file, lastOpened' // Primary key and indexed props
    });
  }
}

export const db = new TandaiPDFDB();

    