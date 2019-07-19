#!/usr/bin/env groovy

pipeline {

    agent {
        docker {
            image 'node'
            args '-u root'
        }
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npm install'
            }
            steps {
                echo 'Building...'
                build job: 'slackSend', parameters: [string(channel:'#general', message: "Build Starts",tokenCredentialId: '287af604-bb01-4aa1-91dd-43733eba02df')]
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npm test'
            }
            steps {
                echo 'Building...'
                sh "slackSend channel: '#general', iconEmoji: '', message: 'Build Completed', tokenCredentialId: '287af604-bb01-4aa1-91dd-43733eba02df', username: ''"
            }
        }
    }
}
