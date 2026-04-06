pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
 
        stage('Install Backend Dependencies') {
            steps {
                echo 'Installing backend node modules...'
                bat 'npm install'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo 'Installing frontend node modules...'
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                echo 'Running automated security, unit, and integration tests...'
                bat 'npm test'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Verifying frontend build...'
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
    }
}