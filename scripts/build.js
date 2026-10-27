const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const buildDirectory = path.join(projectRoot, 'build');

const requiredFiles = [
    'app.js',
    'package.json',
    'package-lock.json'
];

for (const fileName of requiredFiles) {
    const sourcePath = path.join(projectRoot, fileName);

    if (!fs.existsSync(sourcePath)) {
        console.error(
            `Build failed: required file is missing: ${fileName}`
        );
        process.exit(1);
    }
}

fs.rmSync(buildDirectory, {
    recursive: true,
    force: true
});

fs.mkdirSync(buildDirectory, { recursive: true });

for (const fileName of requiredFiles) {
    fs.copyFileSync(
        path.join(projectRoot, fileName),
        path.join(buildDirectory, fileName)
    );
}

console.log(
    'Build completed. Application files are in the build/ directory.'
);