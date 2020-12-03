#!groovy​
pipeline {
    agent any
    parameters {
        //string(name: 'STATUS_EMAIL', defaultValue: 'hwilli@pennmedicine.upenn.edu', description: 'Comma sep list of email addresses that should recieve test status notifications.')
        string(name: 'STATUS_EMAIL', defaultValue: 'hwilli@pennmedicine.upenn.edu, weixuanf@upenn.edu, lacava@upenn.edu, mgstauff@gmail.com', description: 'Comma sep list of email addresses that should recieve test status notifications.')
    }
    options {
        timeout(time: 1, unit: 'HOURS')
    }
    environment {
        LOCAL_PENNAI_DEPLOY_DIR = '/data/git/pennai'
        LOCAL_PENNAI_DEPLOY_FILE = "${LOCAL_PENNAI_DEPLOY_DIR}/docker-compose.yml"
    }
    stages {
        stage('Checkout') {
            steps {
                cleanWs()

                // checkout
                checkout scm
                dir ('target/ai_docs') {echo 'target/ai_docs'}
                dir ('target/test-reports/cobertura') {echo 'target/test-reports/cobertura'}
            }
        }
        stage('Build Docs') {
            agent {
                dockerfile {
                    filename 'docs/Dockerfile'
                    dir '.'
                    args '-u root'
                }
            }
            steps {
                sh 'rm -fdr target'
                dir ('docs') {
                    sh 'make html'
                }
            }
            post {
                always {
                    stash includes: 'target/**', name: 'docs-python'
                }
            }
        }
        stage('Unit Tests') {
            steps {
                sh 'rm -fdr target'
                sh 'docker-compose -f ./docker-compose-unit-test.yml build -m 6g'
                sh 'docker-compose -f ./docker-compose-unit-test.yml up --abort-on-container-exit --force-recreate'
            }
            post {
                always {
                    stash includes: 'target/**', name: 'testresult-unittest'
                }
            }
        }
        stage('Rebuild') {
            steps {
                // rebuild
                sh 'cp config/ai.env-template config/ai.env'
                sh 'docker-compose build -m 6g'
            }

        }
        stage('Stop PennAI Locally') {
            steps {
                sh "docker-compose -f ${LOCAL_PENNAI_DEPLOY_FILE} stop"
            }
        }
        stage('Integration Tests') {
            steps {
                // stop any running pennai test or dev instances
                sh 'docker-compose -f ./docker-compose-int-test.yml stop'

                // run the integration test instance
                sh 'docker-compose -f ./docker-compose-int-test.yml build -m 6g'
                sh 'docker-compose -f ./docker-compose-int-test.yml up --abort-on-container-exit --force-recreate'
            }
            post {
                always {
                    stash includes: 'target/**', name: 'testresult-inttest'
                }
            }
        }
        stage('Start PennAI Locally') {
            steps {
                sh "docker-compose -f ${LOCAL_PENNAI_DEPLOY_FILE} up --detach --force-recreate"
            }
        }
    }
    post {
        always {
            sh '(cd target && ls -lR)'
            cleanWs()
            unstash 'docs-python'
            unstash 'testresult-unittest'
            unstash 'testresult-inttest'

            junit 'target/test-reports/*.xml'
            cobertura autoUpdateHealth: false, autoUpdateStability: false, coberturaReportFile: 'target/test-reports/cobertura/nose_cover.xml', conditionalCoverageTargets: '70, 0, 0', failUnhealthy: false, failUnstable: false, lineCoverageTargets: '80, 0, 0', maxNumberOfBuilds: 0, methodCoverageTargets: '80, 0, 0', onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'target/ai_docs/html', reportFiles: 'index.html, search.html, py-modindex.html', reportName: 'AI docs', reportTitles: ''])

        }
        failure {
            echo 'Pipeline Failure'
            emailext attachLog: false,
                compressLog: false,
                subject: 'Job \'${JOB_NAME}\' (${BUILD_NUMBER}) failure',
                body: '''${SCRIPT, template="groovy-html.template"}''',
                mimeType: 'text/html',
                to: "${params.STATUS_EMAIL}",
                //recipientProviders: [culprits()],
                replyTo: "${params.STATUS_EMAIL}"
        }
        unstable {
            echo 'Pipeline Unstable'
            emailext attachLog: false,
                compressLog: false,
                subject: 'Job \'${JOB_NAME}\' (${BUILD_NUMBER}) unstable',
                body: '''${SCRIPT, template="groovy-html.template"}''',
                mimeType: 'text/html',
                to: "${params.STATUS_EMAIL}",
                //recipientProviders: [culprits()],
                replyTo: "${params.STATUS_EMAIL}"
        }
        fixed {
            echo 'Pipeline is back to normal'
            emailext attachLog: false,
                compressLog: false,
                subject: 'Job \'${JOB_NAME}\' (${BUILD_NUMBER}) is back to normal',
                body: '''${SCRIPT, template="groovy-html.template"}''',
                mimeType: 'text/html',
                to: "${params.STATUS_EMAIL}",
                //recipientProviders: [culprits()],
                replyTo: "${params.STATUS_EMAIL}"
        }
    }
}
