import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, parse, relative, resolve } from 'path';

const sourceDir = process.argv[2];
const destDir = process.argv[3];
const template = process.argv[4];
const NAME_MASK = '[name]';
const EXT_MASK = '[ext]';
const INDEX_MASK = /\[index(\d+)\]/g;

if (!sourceDir || !destDir || !template) {
    console.error('Usage: node copy-dir.js <sourceDir> <destDir> <template>');
    process.exit(1);
}

if (!existsSync(sourceDir)) {
    console.error('Source directory does not exist.');
    process.exit(1);
}

const sourcePath = resolve(sourceDir);
const destPath = resolve(destDir);
const relativePath = relative(sourcePath, destPath);
const isInsideSource = relativePath !== ''
    && !relativePath.startsWith('..')
    && !relativePath.startsWith('/')
    && !relativePath.startsWith('\\');

if (sourcePath === destPath || isInsideSource) {
    console.error('Destination directory must be different from the source directory and cannot be inside it.');
    process.exit(1);
}

if (!existsSync(destPath)) {
    mkdirSync(destPath, { recursive: true });
}

function getIndexWidth() {
    const indexPattern = template.match(INDEX_MASK);
    return indexPattern && indexPattern[0]
        ? parseInt(indexPattern[0].match(/\d+/)?.[0] || '1', 10)
        : 1;
}

function renderTemplate(fileName, currentIndex) {
    const { name, ext } = parse(fileName);
    const extension = ext.startsWith('.') ? ext.slice(1) : ext;
    const indexWidth = getIndexWidth();
    const paddedIndex = String(currentIndex).padStart(indexWidth, '0');

    return template
        .replace(NAME_MASK, name)
        .replace(EXT_MASK, extension)
        .replace(INDEX_MASK, paddedIndex);
}

function copyDirectoryTree(currentSourceDir, currentDestDir) {
    const entries = readdirSync(currentSourceDir, { withFileTypes: true });
    let index = 1;

    for (const entry of entries) {
        const sourceEntry = join(currentSourceDir, entry.name);
        const destEntry = join(currentDestDir, entry.name);

        if (entry.isDirectory()) {
            mkdirSync(destEntry, { recursive: true });
            copyDirectoryTree(sourceEntry, destEntry);
            continue;
        }

        if (entry.isFile()) {
            const renderedName = renderTemplate(entry.name, index);
            const destinationFile = join(currentDestDir, renderedName);

            console.log(`Copying ${sourceEntry} to ${destinationFile}`);
            copyFileSync(sourceEntry, destinationFile);
            console.log(`File ${entry.name} copied successfully.`);
            index += 1;
        }
    }
}

copyDirectoryTree(sourcePath, destPath);