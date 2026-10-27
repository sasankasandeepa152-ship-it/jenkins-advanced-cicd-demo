const fs = require('node:fs');
const path = require('node:path');

const packageJson = require('../package.json');

const projectRoot = path.resolve(__dirname, '..');

const requiredFiles = [
    'Jenkinsfile',
    'app.js',
    'package.json',
    'package-lock.json',
    'test/app.test.js',
    'scripts/build.js',
    'scripts/deploy.js',
    'docs/advanced-features.md'
];

const missingFiles = requiredFiles.filter((fileName) => {
    return !fs.existsSync(path.join(projectRoot, fileName));
});

if (missingFiles.length > 0) {
    console.error(
        `Project check failed. Missing files: ${missingFiles.join(', ')}`
    );
    process.exit(1);
}

if (
    !packageJson.name ||
    !packageJson.scripts ||
    !packageJson.scripts.test
) {
    console.error(
        'Project check failed. package.json is missing required project information or test script.'
    );
    process.exit(1);
}

console.log(
    'Project structure and package metadata checks passed.'
);