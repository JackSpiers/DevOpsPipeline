pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
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
            withSonarQubeEnv('SonarCloud'){
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                  bat '''
                    curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-windows.zip
                    tar -xf sonar-scanner.zip
                    set PATH=%CD%\\sonar-scanner-5.0.1.3006-windows\\bin;%PATH%
                    sonar-scanner.bat -D"sonar.login=%SONAR_TOKEN%"
                  '''
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

                bat '''
                  npm audit --json > audit-report.json
                '''

                bat '''
                  npm audit --audit-level=high
                '''
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
                    bat """
                      docker build -t task-manager:${BUILD_NUMBER} .
                    """

                    bat """
                      powershell -Command "if (docker ps -q --filter \"name=task-manager-test\") {
                                            docker stop task-manager-test
                                            docker rm  task-manager-test
                                          }"
                    """

                    bat """
                      docker run -d ^
                        --name task-manager-test ^
                        -p 3000:3000 ^
                        task-manager:${BUILD_NUMBER}
                    """

                    bat """
                      ping 127.0.0.1 -n 5 >nul
                      curl -f http://localhost:3000/tasks || exit 1
                    """
                }
            }
        }
    
    }
}


