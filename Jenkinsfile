pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKERHUB_CRED    = 'dockerhub-creds'
        MONITOR_RECIPIENT = 'jack.spiers00@gmail.com' 
        DD_APIKEY = 'API_KEYDD'
        DD_APPKEY = 'DDAPPKEY'
    }

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
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                bat 'npm test'
            }
        }

        stage('SonarCloud Analysis') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                        bat 'curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-windows.zip'
                        bat 'powershell -Command "Expand-Archive sonar-scanner.zip -DestinationPath ."'
                        bat 'set PATH=%CD%\\sonar-scanner-5.0.1.3006-windows\\bin;%PATH% && sonar-scanner.bat -D"sonar.login=%SONAR_TOKEN%"'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Security') {
            steps {
                echo 'Running `npm audit` to scan for known vulnerabilities…'
                bat "npm audit --json > audit-report.json"
                bat "npm audit --audit-level=high"
            }
            post {
                always {
                    archiveArtifacts artifacts: 'audit-report.json', fingerprint: true
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Building Docker image and running container as a test deployment…'
                script {
                    bat "docker build -t task-manager:${BUILD_NUMBER} ."

                    bat """
                    powershell -Command "if (docker ps -a -q --filter 'name=task-manager-test') { docker rm -f task-manager-test }"
                    """

                    bat """
                      docker run -d ^
                        --name task-manager-test ^
                        -p 3000:3000 ^
                        task-manager:${BUILD_NUMBER}
                    """

                    bat "ping 127.0.0.1 -n 5 >nul"
                    bat "curl -f http://localhost:3000/tasks || exit 1"
                }
            }
        }

        stage('Release') {
            steps {
                echo 'Tagging and pushing Docker image to Docker Hub…'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PW'
                )]) {
                    script {
                        bat "docker login -u %DOCKER_USER% -p %DOCKER_PW%"
        

                        bat "docker tag task-manager:${BUILD_NUMBER} %DOCKER_USER%/task-manager:${BUILD_NUMBER}"

                        bat "docker tag task-manager:${BUILD_NUMBER} %DOCKER_USER%/task-manager:latest"
        
                        bat "docker push %DOCKER_USER%/task-manager:${BUILD_NUMBER}"
                        bat "docker push %DOCKER_USER%/task-manager:latest"
                    }
                }
            }
        }

        stage('Monitoring & Alerting') {
            steps {
                echo 'Verifying /health status endpoint before notifying Datadog...'
                bat '''
                curl -s -o nul -w "%{http_code}" http://localhost:3000/health | findstr 200 > nul
                if errorlevel 1 exit 1
                '''
            }
            post {
                success {
                    echo 'Sending deployment success event to Datadog'
                    script {
                        def payload = """
                        {
                          "title": "Successful Deployment",
                          "text": "Task Manager deployed successfully at build #${BUILD_NUMBER}.",
                          "priority": "normal",
                          "tags": ["env:production", "app:task-manager"],
                          "alert_type": "success"
                        }
                        """
                        writeFile file: 'dd_event.json', text: payload
                        bat """
                          curl -X POST ^
                            -H "Content-type: application/json" ^
                            -H "DD_APIKEY: ${env.DATADOG_API_KEY}" ^
                            -H "DD_KEY: ${env.DATADOG_APP_KEY}" ^
                            -d @dd_event.json ^
                            "https://api.datadoghq.com/api/v1/events"
                        """
                    }
                }
                failure {
                    echo "Health check failed — no Datadog notification sent."
                }
            }
        }
    }
    post {
        always {
            echo "Cleaning up Docker container if it’s still running..."
            bat "docker rm -f task-manager-test || exit 0"
        }
    }
}
