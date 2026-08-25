# copy-dir.js

Utility script for copying all files from a source directory into a destination directory while renaming them according to a template.

## Usage

```bash
node copy-dir.js <sourceDir> <destDir> <template>
```

## Template placeholders

The `template` supports the following placeholders:

- `[name]` — file name without extension
- `[ext]` — extension without the leading dot
- `[indexN]` — sequence index with zero-padding to width `N`

Examples:

```bash
[name].[ext]
[index2][name].[ext]
[index3][name].[ext]
[name]_[index2].[ext]
```

## Example

```bash
node copy-dir.js ./source ./output "[index3][name].[ext]"
```

If the source folder contains:

```text
file1.txt
file2.txt
file3.txt
```

then the destination folder will contain:

```text
001file1.txt
002file2.txt
003file3.txt
```

## Behavior

- creates the destination directory automatically if it does not exist
- reads all files recursively from the source directory
- recreates nested subdirectories in the destination while keeping the relative structure
- keeps the file content unchanged
- writes the copied files to the destination directory
- adds leading zeros to the index according to the width in the template

## Notes

The index width is specified directly in the template, for example:

```text
[index3]
```

This means the index will be formatted as 3 digits, such as `001`, `002`, `010`.

Nested directories are also copied recursively, preserving their relative paths under the destination folder.
