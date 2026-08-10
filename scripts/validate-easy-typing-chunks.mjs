import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(scriptDirectory, '../data/easy-typing-chunks.json');
const entries = JSON.parse(await readFile(dataPath, 'utf8'));
const errors = [];

if (!Array.isArray(entries)) {
  throw new Error('easy-typing-chunks.json must contain a JSON array.');
}

if (entries.length !== 260) {
  errors.push(`Expected 260 sentences, received ${entries.length}.`);
}

const originals = new Set();
entries.forEach((entry, entryIndex) => {
  const label = `Entry ${entryIndex + 1}`;
  if (!entry || typeof entry.original !== 'string' || !entry.original.trim()) {
    errors.push(`${label}: original is missing.`);
    return;
  }
  if (originals.has(entry.original)) {
    errors.push(`${label}: duplicate original sentence.`);
  }
  originals.add(entry.original);

  if (!Array.isArray(entry.chunks) || entry.chunks.length === 0) {
    errors.push(`${label}: chunks must be a non-empty array.`);
    return;
  }

  entry.chunks.forEach((chunk, chunkIndex) => {
    if (!chunk || typeof chunk.en !== 'string' || !chunk.en.trim()) {
      errors.push(`${label}, chunk ${chunkIndex + 1}: English text is missing.`);
    }
    if (!chunk || typeof chunk.ko !== 'string' || !chunk.ko.trim()) {
      errors.push(`${label}, chunk ${chunkIndex + 1}: Korean text is missing.`);
    }
  });

  const reconstructed = entry.chunks.map(chunk => chunk.en).join(' ');
  if (reconstructed !== entry.original) {
    errors.push(`${label}: English chunks do not reconstruct the original sentence.`);
  }
});

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${entries.length} Easy typing sentences.`);
}
