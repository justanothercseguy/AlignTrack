import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'aligntrack-data') : path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create data dir:', err);
}

export interface LocalDatabaseState {
  users: any[];
  alignerSets: any[];
  wearSessions: any[];
  appointments: any[];
  journalEntries: any[];
  questions: any[];
  notifications: any[];
  pushSubscriptions: any[];
}

let dbCache: LocalDatabaseState = {
  users: [],
  alignerSets: [],
  wearSessions: [],
  appointments: [],
  journalEntries: [],
  questions: [],
  notifications: [],
  pushSubscriptions: [],
};

// Load database from file
export const loadDb = (): LocalDatabaseState => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Error reading local db file, initializing fresh:', err);
    saveDb();
  }
  return dbCache;
};

// Save database to file
export const saveDb = (): void => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local db file:', err);
  }
};

// Generate random hex ObjectId string
export const generateId = (): string => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const random = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16));
  return timestamp + random;
};

// Query matcher helper
export const matchesQuery = (item: any, query: any): boolean => {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatched = value.some((orClause) => matchesQuery(item, orClause));
      if (!orMatched) return false;
      continue;
    }

    if (key === '_id') {
      const itemIdStr = item._id ? item._id.toString() : '';
      const queryIdStr = value ? (value as any).toString() : '';
      if (typeof value === 'object' && value !== null && (value as any).$ne) {
        if (itemIdStr === (value as any).$ne.toString()) return false;
        continue;
      }
      if (itemIdStr !== queryIdStr) return false;
      continue;
    }

    const itemVal = item[key];

    // Handle operator objects: $gte, $lte, $regex, $ne
    if (typeof value === 'object' && value !== null) {
      const op = value as any;
      if (op.$gte !== undefined && !(itemVal >= op.$gte)) return false;
      if (op.$lte !== undefined && !(itemVal <= op.$lte)) return false;
      if (op.$ne !== undefined && itemVal === op.$ne) return false;
      if (op.$regex !== undefined) {
        const regex = new RegExp(op.$regex, op.$options || 'i');
        if (!regex.test(itemVal || '')) return false;
      }
      continue;
    }

    // Direct comparison
    if (itemVal !== value) {
      if (itemVal?.toString() === value?.toString()) {
        continue;
      }
      return false;
    }
  }

  return true;
};

// Helper to wrap raw document with Mongoose-like methods (.save(), .toObject(), comparePassword)
export const wrapDoc = (collectionName: keyof LocalDatabaseState, item: any) => {
  if (!item) return null;

  const doc = { ...item };

  doc._id = item._id || generateId();
  doc.toObject = function (this: any) {
    const copy: any = { ...this };
    delete copy.toObject;
    delete copy.toJSON;
    delete copy.save;
    delete copy.comparePassword;
    return copy;
  };
  doc.toJSON = function (this: any) {
    const copy: any = { ...this };
    delete copy.toObject;
    delete copy.toJSON;
    delete copy.save;
    delete copy.comparePassword;
    return copy;
  };

  // User defaults and password comparison
  if (collectionName === 'users') {
    doc.comparePassword = async (candidate: string) => {
      return bcrypt.compare(candidate, doc.password);
    };
    if (!doc.treatmentSettings) {
      doc.treatmentSettings = {
        schedulingMode: 'actual',
        phases: [
          { name: 'Phase A', startSet: 1, endSet: 5, defaultDurationDays: 10, defaultWearTimeTarget: 18 },
          { name: 'Phase B', startSet: 6, endSet: null, defaultDurationDays: 7, defaultWearTimeTarget: 20 },
        ],
      };
    }
    if (!doc.notificationPreferences) {
      doc.notificationPreferences = {
        appointmentReminder1DayBefore: true,
        appointmentReminderDayOf: false,
        appointmentReminderTime: '09:00',
        alignerReminder3DaysBefore: false,
        alignerReminder2DaysBefore: false,
        alignerReminder1DayBefore: true,
        alignerReminderOnDay: false,
        alignerOverdueReminder: true,
        wearTimeReminder: false,
        wearTimeReminderInterval: 4,
      };
    }
  }

  doc.save = async () => {
    doc.updatedAt = new Date().toISOString();
    const collection = dbCache[collectionName];
    const idx = collection.findIndex((x) => x._id.toString() === doc._id.toString());
    if (idx !== -1) {
      collection[idx] = { ...doc };
    } else {
      collection.push({ ...doc });
    }
    saveDb();
    return wrapDoc(collectionName, doc);
  };

  return doc;
};

// Chainable and Thenable Multiple Document Query
export class LocalQuery {
  private collectionName: keyof LocalDatabaseState;
  private query: any;
  private sortObj?: any;
  private limitNum?: number;

  constructor(collectionName: keyof LocalDatabaseState, query: any) {
    this.collectionName = collectionName;
    this.query = query;
  }

  sort(sortObj: any) {
    this.sortObj = sortObj;
    return this;
  }

  limit(limitNum: number) {
    this.limitNum = limitNum;
    return this;
  }

  populate() {
    return this;
  }

  select() {
    return this;
  }

  private execute(): any[] {
    const raw = dbCache[this.collectionName] || [];
    let items = raw.filter((it) => matchesQuery(it, this.query));

    if (this.sortObj) {
      const [key, dir] = Object.entries(this.sortObj)[0] || ['_id', 1];
      const mult = dir === -1 || dir === '-date' ? -1 : 1;
      items.sort((a, b) => {
        const aVal = a[key] ?? '';
        const bVal = b[key] ?? '';
        return aVal > bVal ? mult : aVal < bVal ? -mult : 0;
      });
    }

    if (this.limitNum !== undefined) {
      items = items.slice(0, this.limitNum);
    }

    return items.map((it) => wrapDoc(this.collectionName, it));
  }

  then(onfulfilled?: (value: any[]) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

// Chainable and Thenable Single Document Query
export class LocalSingleQuery {
  private collectionName: keyof LocalDatabaseState;
  private query: any;

  constructor(collectionName: keyof LocalDatabaseState, query: any) {
    this.collectionName = collectionName;
    this.query = query;
  }

  populate() {
    return this;
  }

  select() {
    return this;
  }

  sort(sortObj: any) {
    return this;
  }

  private execute(): any {
    const raw = dbCache[this.collectionName] || [];
    const item = raw.find((it) => matchesQuery(it, this.query));
    if (!item) return null;
    return wrapDoc(this.collectionName, item);
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

// Generic Collection Mock Model
export class LocalCollectionModel {
  private collectionName: keyof LocalDatabaseState;

  constructor(collectionName: keyof LocalDatabaseState) {
    this.collectionName = collectionName;
  }

  private getCollection(): any[] {
    return dbCache[this.collectionName] || [];
  }

  find(query: any = {}): LocalQuery {
    return new LocalQuery(this.collectionName, query);
  }

  findOne(query: any): LocalSingleQuery {
    return new LocalSingleQuery(this.collectionName, query);
  }

  findById(id: any): LocalSingleQuery {
    return this.findOne({ _id: id });
  }

  async create(data: any): Promise<any> {
    const id = generateId();
    const now = new Date().toISOString();
    const docData = {
      _id: id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    if (this.collectionName === 'users' && data.password && !data.password.startsWith('$2')) {
      docData.password = await bcrypt.hash(data.password, 10);
    }

    dbCache[this.collectionName].push(docData);
    saveDb();
    return wrapDoc(this.collectionName, docData);
  }

  async findOneAndUpdate(query: any, update: any, options: any = {}): Promise<any> {
    const existing = await this.findOne(query);
    if (!existing) {
      if (options.upsert) {
        const data = update.$set ? { ...query, ...update.$set } : { ...query, ...update };
        return this.create(data);
      }
      return null;
    }

    const updates = update.$set ? update.$set : update;
    Object.assign(existing, updates);
    await existing.save();
    return existing;
  }

  async findByIdAndUpdate(id: any, update: any, options: any = {}): Promise<any> {
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  async findOneAndDelete(query: any): Promise<any> {
    const collection = dbCache[this.collectionName];
    const idx = collection.findIndex((it) => matchesQuery(it, query));
    if (idx === -1) return null;
    const removed = collection.splice(idx, 1)[0];
    saveDb();
    return wrapDoc(this.collectionName, removed);
  }

  async findByIdAndDelete(id: any): Promise<any> {
    return this.findOneAndDelete({ _id: id });
  }

  async deleteMany(query: any): Promise<{ deletedCount: number }> {
    const beforeCount = dbCache[this.collectionName].length;
    dbCache[this.collectionName] = dbCache[this.collectionName].filter((it) => !matchesQuery(it, query));
    const deletedCount = beforeCount - dbCache[this.collectionName].length;
    saveDb();
    return { deletedCount };
  }

  async updateMany(query: any, update: any): Promise<void> {
    const updates = update.$set ? update.$set : update;
    for (const item of dbCache[this.collectionName]) {
      if (matchesQuery(item, query)) {
        Object.assign(item, updates);
        item.updatedAt = new Date().toISOString();
      }
    }
    saveDb();
  }

  async countDocuments(query: any = {}): Promise<number> {
    return this.getCollection().filter((it) => matchesQuery(it, query)).length;
  }

  async exists(query: any): Promise<boolean> {
    return !!this.getCollection().find((it) => matchesQuery(it, query));
  }
}

// Pre-instantiated models
export const LocalUser = new LocalCollectionModel('users');
export const LocalAlignerSet = new LocalCollectionModel('alignerSets');
export const LocalWearSession = new LocalCollectionModel('wearSessions');
export const LocalAppointment = new LocalCollectionModel('appointments');
export const LocalJournalEntry = new LocalCollectionModel('journalEntries');
export const LocalQuestion = new LocalCollectionModel('questions');
export const LocalNotification = new LocalCollectionModel('notifications');
export const LocalPushSubscription = new LocalCollectionModel('pushSubscriptions');

// Initialize on import
loadDb();
