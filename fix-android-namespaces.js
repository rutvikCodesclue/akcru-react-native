
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const findFiles = (dir, filename) => {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name === 'node_modules') continue;
      results = results.concat(findFiles(fullPath, filename));
    } else if (file.name === filename) {
      results.push(fullPath);
    }
  }
  return results;
};

const cleanManifest = (manifestPath) => {
  let xml = fs.readFileSync(manifestPath, 'utf8');
  const original = xml;
  xml = xml.replace(/<manifest([^>]*?)\s+package="[^"]+"/, '<manifest$1');
  if (xml !== original) {
    fs.writeFileSync(manifestPath, xml, 'utf8');
    console.log(`🧼 Stripped package from: ${manifestPath}`);
    return true;
  }
  return false;
};

const injectNamespace = (gradlePath, namespaceValue) => {
  let gradle = fs.readFileSync(gradlePath, 'utf8');
  const original = gradle;
  const androidMatch = gradle.match(/android\s*{[\s\S]*?}/);
  if (androidMatch) {
    const block = androidMatch[0];
    if (!block.includes('namespace')) {
      const updatedBlock = block.replace(/android\s*{/, `android {\n    namespace "${namespaceValue}"`);
      gradle = gradle.replace(block, updatedBlock);
      fs.writeFileSync(gradlePath, gradle, 'utf8');
      console.log(`📛 Added namespace to: ${gradlePath}`);
      return true;
    }
  }
  return false;
};

const extractPackageName = (manifestPath) => {
  const xml = fs.readFileSync(manifestPath, 'utf8');
  const match = xml.match(/package="([^"]+)"/);
  return match ? match[1] : null;
};

const findGradlePath = (startDir) => {
  let dir = path.dirname(startDir);
  while (dir && dir !== path.resolve('node_modules')) {
    const gradlePath = path.join(dir, 'build.gradle');
    if (fs.existsSync(gradlePath)) return gradlePath;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
};

const findPackageName = (manifestPath) => {
  const parts = manifestPath.split(path.sep);
  const nodeIndex = parts.lastIndexOf('node_modules');
  if (nodeIndex === -1) return null;

  const slice = parts.slice(nodeIndex + 1);
  const pkgParts = [];
  for (const part of slice) {
    if (part === 'android') break;
    pkgParts.push(part);
  }

  return pkgParts.join('/');
};

const main = () => {
  const manifests = findFiles('node_modules', 'AndroidManifest.xml');
  const patched = new Set();

  for (const manifestPath of manifests) {
    const gradlePath = findGradlePath(manifestPath);
    const pkgName = findPackageName(manifestPath);
    const namespace = extractPackageName(manifestPath) || 'com.autofix.temp';

    if (!pkgName || !gradlePath) continue;

    const cleaned = cleanManifest(manifestPath);
    const injected = injectNamespace(gradlePath, namespace);

    if (cleaned || injected) {
      try {
        execSync(`npx patch-package ${pkgName}`, { stdio: 'inherit' });
        patched.add(pkgName);
      } catch (err) {
        console.warn(`⚠️ Failed to patch ${pkgName}`);
      }
    }
  }

  if (patched.size === 0) {
    console.log('✅ No changes necessary. All manifests and gradle files are clean.');
  } else {
    console.log(`✅ Patches created for: ${Array.from(patched).join(', ')}`);
  }
};

main();
