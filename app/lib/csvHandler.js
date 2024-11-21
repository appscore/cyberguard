import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'data', 'model-config.csv');

export async function readCSV() {
  try {
    const fileContent = await fs.readFile(CSV_PATH, 'utf-8');
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    throw error;
  }
}

export async function writeCSV(data) {
  try {
    const csvContent = stringify(data, { header: true });
    await fs.writeFile(CSV_PATH, csvContent);
  } catch (error) {
    console.error('Error writing CSV:', error);
    throw error;
  }
}

export async function findById(id) {
  const records = await readCSV();
  return records.find(record => record.id === id);
}


export async function getNextId() {
  const records = await readCSV();
  if (records.length === 0) return 1;
  const maxId = Math.max(...records.map(record => parseInt(record.id)));
  return maxId + 1;
}

export async function updateRecord(id, newData) {
  const records = await readCSV();
  const index = records.findIndex(record => record.id === id);
  
  if (index === -1) return null;
  
  records[index] = { ...records[index], ...newData };
  await writeCSV(records);
  return records[index];
}

export async function deleteRecord(id) {
  const records = await readCSV();
  const filteredRecords = records.filter(record => record.id !== id);
  
  if (filteredRecords.length === records.length) return false;
  
  await writeCSV(filteredRecords);
  return true;
}

export async function createRecord(data) {
  const records = await readCSV();
  const newRecord = {
    ...data,
    id: await getNextId()
  };
  records.push(newRecord);
  await writeCSV(records);
  return newRecord;
}

export async function createRecordWithId(id,data) {
  const records = await readCSV();
  const newRecord = {
    ...data,
    id: id
  };
  records.push(newRecord);
  await writeCSV(records);
  return newRecord;
}