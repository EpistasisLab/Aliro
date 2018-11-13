#!groovy​
pipeline {
    agent any 
    parameters {
        //string(name: 'STATUS_EMAIL', defaultValue: 'hwilli@pennmedicine.upenn.edu', description: 'Comma sep list of email addresses that should recieve test status notifications.')
        string(name: 'STATUS_EMAIL', defaultValue: 'hwilli@pennmedicine.upenn.edu, weixuanf@pennmedicine.upenn.edu, lacava@upenn.edu', description: 'Comma sep list of email addresses that should recieve test status notifications.')
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
                    dir 'tests/unit'
                    args '-u root'
                }
            } 
            steps {
                sh 'rm -fdr target'
                dir ('ai') {
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
            agent {
                dockerfile { 
                    dir 'tests/unit'
                    args '-u root'
                }
            }   
            steps {
                sh 'rm -fdr target'
                sh 'sh tests/unit_test_runner.sh'
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
                sh 'docker build ./dockers/base -t pennai/base:latest'
                sh 'docker-compose build'
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
                sh 'docker-compose -f ./docker-compose-int-test.yml build'
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
            echo 'Pipeline failure'
            emailext attachLog: false, 
                compressLog: false,
                subject: 'Job \'${JOB_NAME}\' (${BUILD_NUMBER}) failure',
                body: 'Please go to ${BUILD_URL} to view build details.', 
                to: "${params.STATUS_EMAIL}",
                //recipientProviders: [culprits()],
                replyTo: "${params.STATUS_EMAIL}"
        }
        unstable {
            echo 'Pipeline Unstable'
            emailext attachLog: false, 
                compressLog: false,
                subject: 'Job \'${JOB_NAME}\' (${BUILD_NUMBER}) unstable',
                body: 'Please go to ${BUILD_URL} to view build details.', 
                to: "${params.STATUS_EMAIL}",
                //recipientProviders: [culprits()],
                replyTo: "${params.STATUS_EMAIL}"
        }
        fixed {
            echo 'Pipeline is back to normal'
            emailext attachLog: false, 
                compressLog: false,
                subject: 'Job \'${JOB_NAME}\' (${BUILD_NUMBER}) is back to normal',
                body: 'Please go to ${BUILD_URL} to view build details.', 
                to: "${params.STATUS_EMAIL}",
                //recipientProviders: [culprits()], 
                replyTo: "${params.STATUS_EMAIL}"
        }
    }
}