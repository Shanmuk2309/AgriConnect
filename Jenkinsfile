pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // This tells Jenkins to pull the latest code from your GitHub branch
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing node modules...'
                // 'bat' is used here to run commands on Windows
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running automated security and unit tests...'
                bat 'npm test'
            }
        }
    }
}