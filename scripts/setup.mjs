import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envExamplePath = path.join(rootDir, '.env.example');
const envLocalPath = path.join(rootDir, '.env.local');

if (!fs.existsSync(envExamplePath)) {
  console.error('Missing .env.example in project root.');
  process.exit(1);
}

if (fs.existsSync(envLocalPath)) {
  console.log('.env.local already exists, keeping current values.');
  process.exit(0);
}

fs.copyFileSync(envExamplePath, envLocalPath);
console.log('Created .env.local from .env.example');
console.log('Review .env.local values before running in non-local environments.');
