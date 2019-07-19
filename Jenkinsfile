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
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npm test'
            }
        }
    }
    post {
       // only triggered when blue or green sign
       success {
           slackSend channel: '#general', iconEmoji: '', message: 'Build Success', tokenCredentialId: '287af604-bb01-4aa1-91dd-43733eba02df', username: ''
       }
       // triggered when red sign
       failure {
          slackSend channel: '#general', iconEmoji: '', message: 'Build Failed', tokenCredentialId: '287af604-bb01-4aa1-91dd-43733eba02df', username: ''
       }
    }
}
