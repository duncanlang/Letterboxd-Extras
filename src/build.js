import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = process.argv[2] || 'chrome';
if (!['chrome', 'firefox'].includes(target)) {
	console.error('Usage: node build.js chrome | firefox');
	process.exit(1);
}

const sourceDir = __dirname;
const commonDir = path.join(sourceDir, 'common');
const userJsBuildDir = path.join(sourceDir, 'user.js', 'build');
const targetDir = path.join(sourceDir, target);
const distDir = path.join(sourceDir, 'dist', target);

// Clean dist dir
if (fs.existsSync(distDir)) {
	fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(src, dest, excludeDirs = []) {
	if (!fs.existsSync(src)) return;
	const stat = fs.statSync(src);
	if (stat.isDirectory()) {
		if (excludeDirs.includes(path.basename(src))) return;
		fs.mkdirSync(dest, { recursive: true });
		for (const child of fs.readdirSync(src)) {
			copyRecursive(path.join(src, child), path.join(dest, child), excludeDirs);
		}
	} else {
		fs.copyFileSync(src, dest);
	}
}

// 1. Copy common directory files
copyRecursive(commonDir, distDir, ['node_modules']);

// 2. Copy rollup built user.js
if (fs.existsSync(userJsBuildDir)) {
	copyRecursive(userJsBuildDir, distDir);
}

// 3. Copy target (chrome/firefox) specific files including manifest.json
if (fs.existsSync(targetDir)) {
	copyRecursive(targetDir, distDir);
}

console.log(`Build complete: ${distDir}`);
