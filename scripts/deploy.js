const fs = require('node:fs');
const path = require('node:path');

const target = process.argv[2];

const allowedTargets = ['staging', 'production'];

if (!allowedTargets.includes(target)) {
    console.error(
        'Usage: node scripts/deploy.js <staging|production>'
    );
    process.exit(1);
}

// The secret is used as a gate for this learning demo.
// Never print it or save its value in a file.
if (!process.env.DEPLOY_TOKEN) {
    console.error(
        'Deployment stopped: Jenkins credential DEPLOY_TOKEN is not available.'
    );
    process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');

const buildDirectory = path.join(
    projectRoot,
    'build'
);

const destinationDirectory = path.join(
    projectRoot,
    'deploy-output',
    target
);

const filesToDeploy = [
    'app.js',
    'package.json',
    'package-lock.json'
];

for (const fileName of filesToDeploy) {
    if (!fs.existsSync(path.join(buildDirectory, fileName))) {
        console.error(
            `Deployment stopped: build file is missing: ${fileName}`
        );
        process.exit(1);
    }
}

fs.rmSync(destinationDirectory, {
    recursive: true,
    force: true
});

fs.mkdirSync(destinationDirectory, {
    recursive: true
});

for (const fileName of filesToDeploy) {
    fs.copyFileSync(
        path.join(buildDirectory, fileName),
        path.join(destinationDirectory, fileName)
    );
}

const deploymentInfo = {
    target,
    deployedAt: new Date().toISOString(),
    sourceBranch: process.env.BRANCH_NAME || 'local-demo'
};

fs.writeFileSync(
    path.join(destinationDirectory, 'deployment-info.json'),
    `${JSON.stringify(deploymentInfo, null, 2)}\n`,
    'utf8'
);

console.log(`Simulated ${target} deployment completed.`);
console.log(`Output directory: ${destinationDirectory}`);
console.log(
    'Jenkins credential was available. Its secret value was not printed or saved.'
);