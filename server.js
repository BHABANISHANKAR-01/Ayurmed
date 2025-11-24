import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log('=== Server Startup ===');
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

// Find dist folder - try relative to current working directory first
let distPath = null;

// Priority order:
// 1. dist in current working directory
// 2. dist in __dirname
// 3. dist one level up

const candidates = [
  join(process.cwd(), 'dist'),
  join(__dirname, 'dist'),
  join(__dirname, '..', 'dist')
];

for (const candidate of candidates) {
  console.log(`Checking: ${candidate}`);
  if (fs.existsSync(candidate)) {
    const indexExists = fs.existsSync(join(candidate, 'index.html'));
    console.log(`  ✓ Found (index.html: ${indexExists ? 'yes' : 'no'})`);
    if (indexExists) {
      distPath = candidate;
      break;
    }
  }
}

if (!distPath) {
  console.error('\n✗ ERROR: Could not find dist folder with index.html');
  console.error('\nChecked paths:');
  candidates.forEach(p => console.error(`  - ${p}`));
  console.error('\nCurrent directory contents:');
  try {
    console.error(fs.readdirSync(process.cwd()));
  } catch (e) {
    console.error('Could not read directory');
  }
  process.exit(1);
}

console.log(`\n✓ Using dist at: ${distPath}\n`);

// Serve static files
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: false
}));

// SPA fallback - serve index.html for all non-file routes
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err.message);
      res.status(500).send('Internal Server Error');
    }
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server listening on port ${PORT}`);
  console.log(`✓ Ready for requests\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
