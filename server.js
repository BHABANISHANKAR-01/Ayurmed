import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Try multiple possible dist paths
let distPath;
const possiblePaths = [
  join(__dirname, 'dist'),
  join(__dirname, '..', 'dist'),
  '/opt/render/project/dist'
];

for (const path of possiblePaths) {
  if (fs.existsSync(path)) {
    distPath = path;
    console.log('✓ Found dist at:', distPath);
    break;
  }
}

if (!distPath) {
  console.error('✗ Could not find dist folder in any expected location');
  console.error('Checked paths:', possiblePaths);
  process.exit(1);
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// Handle client-side routing - send index.html for all routes
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('Not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving files from: ${distPath}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
