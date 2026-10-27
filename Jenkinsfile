pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['AUTO', 'STAGING', 'PRODUCTION', 'NONE'],
            description: 'AUTO follows branch policy. STAGING deploys develop only. PRODUCTION deploys main only after approval. NONE skips deployment.'
        )

        booleanParam(
            name: 'RUN_EXTRA_CHECKS',
            defaultValue: true,
            description: 'Run the optional project-structure validation in parallel with the other tests.'
        )
    }

    stages {
        stage('Show Build Information') {
            steps {
                echo "Branch being built: ${env.BRANCH_NAME}"
                echo "Requested deployment target: ${params.DEPLOY_TARGET}"
                echo "Extra checks enabled: ${params.RUN_EXTRA_CHECKS}"
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build Application') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Parallel Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        bat 'npm test'
                    }
                }

                stage('Syntax Check') {
                    steps {
                        bat 'npm run check'
                    }
                }

                stage('Optional Project Check') {
                    when {
                        expression { return params.RUN_EXTRA_CHECKS }
                    }
                    steps {
                        bat 'npm run metadata-check'
                    }
                }
            }
        }

        stage('Branch Behaviour') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        echo 'Branch policy: main is the production branch. Production deployment needs DEPLOY_TARGET=AUTO or PRODUCTION and manual approval.'
                    } else if (env.BRANCH_NAME == 'develop') {
                        echo 'Branch policy: develop may deploy to staging when DEPLOY_TARGET=AUTO or STAGING.'
                    } else {
                        echo 'Branch policy: this is a feature/other branch. Run validation only; deployment stages are disabled.'
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                allOf {
                    branch 'develop'
                    anyOf {
                        expression { params.DEPLOY_TARGET == 'AUTO' }
                        expression { params.DEPLOY_TARGET == 'STAGING' }
                    }
                }
            }
            steps {
                withCredentials([
                    string(
                        credentialsId: 'demo-deploy-token',
                        variable: 'DEPLOY_TOKEN'
                    )
                ]) {
                    bat 'node scripts/deploy.js staging'
                }
            }
        }

        stage('Approve Production Deployment') {
            when {
                allOf {
                    branch 'main'
                    anyOf {
                        expression { params.DEPLOY_TARGET == 'AUTO' }
                        expression { params.DEPLOY_TARGET == 'PRODUCTION' }
                    }
                }
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    input(
                        message: 'Tests passed. Do you approve the simulated PRODUCTION deployment?',
                        ok: 'Approve production deployment'
                    )
                }
            }
        }

        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    anyOf {
                        expression { params.DEPLOY_TARGET == 'AUTO' }
                        expression { params.DEPLOY_TARGET == 'PRODUCTION' }
                    }
                }
            }
            steps {
                withCredentials([
                    string(
                        credentialsId: 'demo-deploy-token',
                        variable: 'DEPLOY_TOKEN'
                    )
                ]) {
                    bat 'node scripts/deploy.js production'
                }
            }
        }
    }

    post {
        success {
            echo "NOTIFICATION: SUCCESS | Job: ${env.JOB_NAME} | Branch: ${env.BRANCH_NAME} | Build: ${env.BUILD_NUMBER}"
        }

        failure {
            echo "NOTIFICATION: FAILURE | Job: ${env.JOB_NAME} | Branch: ${env.BRANCH_NAME} | Build: ${env.BUILD_NUMBER} | Check the Jenkins console output."
        }

        aborted {
            echo "NOTIFICATION: ABORTED | Job: ${env.JOB_NAME} | Branch: ${env.BRANCH_NAME} | Build: ${env.BUILD_NUMBER}"
        }

        always {
            echo "Pipeline finished. Final result: ${currentBuild.currentResult}"
        }
    }
}