pipeline {
    agent any

    environment {
        DOCKER_HOST = 'tcp://localhost:2375'
        DOCKER_USERNAME='shanmuk2309'
        MONGO_ATLAS_URI = 'mongodb://Shanmuk:%40Pandu2006@ac-c0lijgx-shard-00-00.movdrxf.mongodb.net:27017,ac-c0lijgx-shard-00-01.movdrxf.mongodb.net:27017,ac-c0lijgx-shard-00-02.movdrxf.mongodb.net:27017/AgriDB?ssl=true&replicaSet=atlas-c84kpj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster-1'
        JWT_SECRET='ab55cc7adf416bfb12997c54c2589df9ee35dbc87e5d6854765d5d321dd9d9bbdf0963a1e7160abab791ae244a06b58ed9c97250078ed7adacc2f10e61f80652'
    }

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

        stage('Code Coverage') {
            steps {
                echo 'Generating code coverage report...'
                bat 'npm test -- --coverage'
            }
        }

        stage('Performance Test') {
            steps {
                echo 'Running performance tests with dynamic JWT token...'
                // Ensure your server is running before this stage or start it in the background
                bat 'npm run test:perf'
            }
        }

        stage('API Tests (Newman)') {
            steps {
                echo 'Running Postman/Newman API tests...'
                bat 'npm run test:api'
            }
        }


        stage('Build Docker Images') {
            steps {
                echo 'Building backend and frontend Docker images...'
                bat 'docker build -t %DOCKER_USERNAME%/agriconnect-backend:latest .'
                bat 'docker build -t %DOCKER_USERNAME%/agriconnect-frontend:latest ./frontend'
            }
        }

        stage('Push to Docker Registry') {
            steps {
                echo 'Pushing images to Docker Registry...'
                // Authenticate with Docker Hub using Jenkins credentials
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                }
                bat 'docker push %DOCKER_USERNAME%/agriconnect-backend:latest'
                bat 'docker push %DOCKER_USERNAME%/agriconnect-frontend:latest'
            }
        }
    }
}