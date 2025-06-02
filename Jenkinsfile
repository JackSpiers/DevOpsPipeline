pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKERHUB_CRED    = 'dockerhub-creds'
        MONITOR_RECIPIENT = 'jack.spiers00@gmail.com' 
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

        stage('Monitoring') {
            steps {
                echo 'Running health check against http://localhost:3000/health ...'
                bat '''
                curl -s -o nul -w "%{http_code}" http://localhost:3000/health | findstr 200 > nul
                if errorlevel 1 exit 1
                '''
            }
            post {
                failure {
                    echo "Health check FAILED – sending alert e-mail to ${env.MONITOR_RECIPIENT}"
                    emailext(
                        to: "${env.MONITOR_RECIPIENT}",
                        subject: "ALERT: Task Manager health check failed at Build #${env.BUILD_NUMBER}",
                        body: """\
                        <p><b>Health check failure</b></p>
                        <p>The pipeline’s Monitoring stage detected that <code>http://localhost:3000/health</code> returned a non-200 status.</p>
                        <p>Build: <a href="${env.BUILD_URL}">${env.JOB_NAME} #${env.BUILD_NUMBER}</a></p>
                        <p>Please investigate the container logs for more details.</p>
                        """
                    )
                }
                success {
                    echo "Health check passed."
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
