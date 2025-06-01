pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm install'
                echo 'Build complete.'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                bat 'npm test'
            }
        }
    }
}

