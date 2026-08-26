import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TABLES_FILE = path.join(DATA_DIR, "tables.json");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");
const VERIFICATIONS_FILE = path.join(DATA_DIR, "verifications.json");

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// TABLES
export function getAllTables(): any[] {
  return readJsonFile<any[]>(TABLES_FILE, []);
}

export function saveTable(table: any): any[] {
  const tables = getAllTables();
  const index = tables.findIndex((t) => t.id === table.id);
  if (index >= 0) {
    tables[index] = { ...tables[index], ...table };
  } else {
    tables.unshift(table);
  }
  writeJsonFile(TABLES_FILE, tables);
  return tables;
}

export function deleteTable(tableId: string): any[] {
  let tables = getAllTables();
  tables = tables.filter((t) => t.id !== tableId);
  writeJsonFile(TABLES_FILE, tables);
  return tables;
}

// APPLICATIONS
export function getAllApplications(): any[] {
  return readJsonFile<any[]>(APPLICATIONS_FILE, []);
}

export function saveApplication(app: any): any[] {
  const apps = getAllApplications();
  const index = apps.findIndex((a) => a.id === app.id);
  if (index >= 0) {
    apps[index] = { ...apps[index], ...app };
  } else {
    apps.unshift(app);
  }
  writeJsonFile(APPLICATIONS_FILE, apps);
  return apps;
}

// VERIFICATION REQUESTS
export function getAllVerifications(): any[] {
  return readJsonFile<any[]>(VERIFICATIONS_FILE, []);
}

export function saveVerification(req: any): any[] {
  const reqs = getAllVerifications();
  const index = reqs.findIndex((r) => r.id === req.id);
  if (index >= 0) {
    reqs[index] = { ...reqs[index], ...req };
  } else {
    reqs.unshift(req);
  }
  writeJsonFile(VERIFICATIONS_FILE, reqs);
  return reqs;
}
