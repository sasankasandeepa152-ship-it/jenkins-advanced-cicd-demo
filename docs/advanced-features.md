# Advanced Jenkins CI/CD Features — Written Explanation

## 1. Multi-branch pipeline and branch-specific behaviour

This project uses a Jenkins Multibranch Pipeline. Instead of creating a separate Jenkins job for every Git branch, Jenkins scans the GitHub repository and creates a branch job for each branch that contains a `Jenkinsfile`. The `BRANCH_NAME` environment variable tells the pipeline which branch is being built. This is useful because a change in a development branch should not automatically be treated like a release that is ready for production.

The project follows three simple branch policies. The `feature/...` branches run the build and validation stages but do not deploy. The `develop` branch may deploy the built application to the staging output directory. The `main` branch may deploy to the production output directory, but only after a manual approval. The `Branch Behaviour` stage prints the policy in the Jenkins console so a learner can see which path applies. Deploy stages also contain their own `when` conditions; the log message alone does not control deployment. This separation makes the deployment rule explicit in the pipeline configuration.

## 2. Parallel testing stages

After dependencies are installed and the application has been built, the `Parallel Tests` stage runs separate checks at the same time. `Unit Tests` runs the Node.js built-in test runner against the application's `/` and `/health` routes. `Syntax Check` asks Node.js to check the JavaScript files for syntax errors. `Optional Project Check` confirms that the expected source, test, build, pipeline, and explanation files exist and that `package.json` contains a test script.

These checks do different jobs. Unit tests check behaviour, syntax checks catch code that cannot be parsed, and the project check catches missing deliverable files. Parallel execution can reduce overall pipeline time because Jenkins does not need to finish one check before starting the others. The checks still need enough Jenkins executor capacity to run concurrently; with limited capacity Jenkins may queue some branches of the parallel stage instead of running all of them at exactly the same moment.

## 3. User-input parameters

The pipeline declares two parameters. `DEPLOY_TARGET` is a choice parameter with `AUTO`, `STAGING`, `PRODUCTION`, and `NONE` options. `AUTO` follows the branch policy, `STAGING` requests staging, `PRODUCTION` requests production, and `NONE` skips deployment. The parameter is a request, not permission to bypass the branch rules. For example, selecting `PRODUCTION` on `develop` still does not deploy to production, because the production stage also requires the `main` branch.

`RUN_EXTRA_CHECKS` is a Boolean parameter. When it is true, the optional project-structure check runs. When false, Jenkins skips that check. These parameters make the same Jenkinsfile useful for several test runs without editing the code for each run. They also give the person starting a build a clear way to select how much validation to perform and whether a deployment is requested.

## 4. Conditional deployment using `when`

The `when` directive prevents a stage from running unless its conditions match. The staging stage requires the branch to be `develop` and the deployment parameter to be `AUTO` or `STAGING`. Both conditions must be true. The production approval and production deployment stages require the `main` branch and the parameter to be `AUTO` or `PRODUCTION`.

The use of both branch and parameter conditions is intentional. A parameter alone must not be able to turn a feature branch into a production deployment. The production stage also appears after the approval stage, so the pipeline cannot reach its deployment step unless the approval stage finishes successfully. If the conditions are false, Jenkins marks the stage as skipped rather than deploying to the wrong target.

## 5. Credentials and secret management

The Jenkinsfile refers to a credential by ID: `demo-deploy-token`. The actual secret value is stored in Jenkins Credentials, not inside this GitHub repository. During a deployment stage, `withCredentials` makes the Secret Text credential available to the deployment script as the environment variable `DEPLOY_TOKEN`. The script checks that the value is present, but it never prints the value or writes it into the deployment output.

The credential value used for this learning exercise should be a made-up demo value, not a real cloud token, password, or personal access token. The example deployment is local and simulated; therefore the credential acts as a gate proving that the pipeline can retrieve a secret safely. In a real deployment, the same pattern would be connected to an actual deployment command or service that needs authentication. Real secrets should be scoped to the smallest number of jobs and users possible, and must not be committed to GitHub or echoed into build logs. Jenkins documentation explains that stored credentials are encrypted and accessed by their IDs.

## 6. Post blocks and notifications

The top-level `post` section handles the pipeline result after the stages have completed. `success` prints a success notification containing the job name, branch, and build number. `failure` prints a failure notification and points the learner to the Jenkins console output. `aborted` reports a build that was stopped or whose approval timed out. `always` prints the final result regardless of how the run ended.

For this beginner project, these are Jenkins-console notifications; they are visible in the build's Console Output and do not send email, SMS, or chat messages. External delivery would require configuring a notification service and its credentials separately. Keeping the result handling in `post` means the notification logic is not repeated in every build, test, or deployment stage.

## 7. Manual production approval gate

The `Approve Production Deployment` stage runs only for `main` when `DEPLOY_TARGET` is `AUTO` or `PRODUCTION`. It pauses the pipeline and asks an authorized Jenkins user to approve the production deployment. The approval prompt is wrapped in a ten-minute timeout so that an unattended build does not wait forever. If the user approves, the next stage can deploy; if the user aborts or the prompt times out, the deployment does not proceed.

This approval gate demonstrates a separation between automated testing and a human release decision. Passing tests is necessary, but the team may still need to check the release timing or other operational factors before production deployment. The example does not deploy to a real server: it copies the built files to `deploy-output/production` and writes a small `deployment-info.json` file. This makes the result easy to inspect during assessment without risking a real production system.

## Scope and limitations

This is a learning demonstration, not a public production service. Staging and production deployments are simulated by copying files into local output folders. The notifications are written to the Jenkins console. A public GitHub repository, a working Jenkins Multibranch Pipeline, Node.js installed where the Jenkins agent can access it, and the `demo-deploy-token` credential are needed to run the exercise as written.