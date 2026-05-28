const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const htmlPath = path.join(__dirname, 'public', 'docs', 'IRMS Prototype _Standalone_.html');
const outDir = path.join(__dirname, 'unpacked');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Reading HTML file...');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Find manifest
const manifestMatch = htmlContent.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
if (!manifestMatch) {
  console.error('Manifest not found!');
  process.exit(1);
}

const manifest = JSON.parse(manifestMatch[1].trim());
console.log(`Found manifest with ${Object.keys(manifest).length} assets.`);

for (const [uuid, entry] of Object.entries(manifest)) {
  console.log(`Processing ${uuid} (${entry.mime})...`);
  const buffer = Buffer.from(entry.data, 'base64');
  let unpackedBuffer = buffer;
  if (entry.compressed) {
    try {
      unpackedBuffer = zlib.gunzipSync(buffer);
    } catch (err) {
      console.error(`Failed to decompress ${uuid}:`, err.message);
    }
  }

  // Determine a filename or save as uuid
  let ext = 'bin';
  if (entry.mime === 'application/javascript' || entry.mime === 'text/javascript') ext = 'js';
  else if (entry.mime === 'text/css') ext = 'css';
  else if (entry.mime === 'text/html') ext = 'html';
  else if (entry.mime === 'application/json') ext = 'json';

  const filename = `${uuid}.${ext}`;
  fs.writeFileSync(path.join(outDir, filename), unpackedBuffer);
}

// Find template
const templateMatch = htmlContent.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
if (templateMatch) {
  const template = JSON.parse(templateMatch[1].trim());
  fs.writeFileSync(path.join(outDir, 'template.html'), template);
  console.log('Saved template.html');
}

// Find external resources if any
const extMatch = htmlContent.match(/<script type="__bundler\/ext_resources">([\s\S]*?)<\/script>/);
if (extMatch) {
  const extResources = JSON.parse(extMatch[1].trim());
  fs.writeFileSync(path.join(outDir, 'ext_resources.json'), JSON.stringify(extResources, null, 2));
  console.log('Saved ext_resources.json');
}

console.log('Done unpacking!');
