#!/bin/bash
set -e

echo "=== Build Script Starting ==="
echo "Node version:"
node --version

echo "NPM version:"
npm --version

echo "Current directory:"
pwd

echo "Contents of current directory:"
ls -la

echo "=== Installing dependencies ==="
npm install

echo "=== Running vite build ==="
npm run build

echo "=== Checking dist folder ==="
if [ -d "dist" ]; then
  echo "✓ dist folder created successfully"
  ls -la dist/
else
  echo "✗ ERROR: dist folder was not created!"
  exit 1
fi

echo "=== Build completed successfully ==="
