import {readdir, ReadStream, WriteStream, existsSync, mkdirSync } from 'fs';
import {parse, join} from 'path';

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

if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
}

readdir(sourceDir, (err, files) => {
    if (err) {
        console.error('Error reading source directory:', err);
        process.exit(1);
    }
    else {
        let index = 1;
        files.forEach((file) => {
            const sourceFile = `${sourceDir}/${file}`;
            const { name, ext } = parse(file);
            const extension = ext.startsWith('.') ? ext.slice(1) : ext; // Remove leading dot from extension
            const currentIndex = index++;
            const indexPattern = template.match(INDEX_MASK);
            const indexWidth = indexPattern && indexPattern[0]
                ? parseInt(indexPattern[0].match(/\d+/)?.[0] || '1', 10)
                : 1;
            const paddedIndex = String(currentIndex).padStart(indexWidth, '0');
            const renderedTemplate = template.replace(NAME_MASK, name)
                .replace(EXT_MASK, extension)
                .replace(INDEX_MASK, paddedIndex);
            const destFile = join(destDir, renderedTemplate);
    
            console.log(`Template: ${template}, name: ${name}, ext: ${ext}, index: ${currentIndex}, paddedIndex: ${paddedIndex}`);
            console.log(`Copying ${sourceFile} to ${destFile}`);

            const rs = new ReadStream(sourceFile);
            const ws = new WriteStream(destFile);
            rs.pipe(ws);
            rs.on('end', () => {
                console.log(`File ${file} copied successfully.`);
            });
        })
    }
}); 