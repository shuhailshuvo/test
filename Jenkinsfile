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
                build job: 'slackSend', parameters: [string(channel:'#general', message: "Build Starts",tokenCredentialId: '287af604-bb01-4aa1-91dd-43733eba02df')]
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npm test'
                build job: 'slackSend', parameters: [string(channel:'#general', message: "Build End",tokenCredentialId: '287af604-bb01-4aa1-91dd-43733eba02df')]
            }
        }
    }
}
