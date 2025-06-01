pipeline {
  agent any

  tools { nodejs 'Node18' }

  environment {
    DOCKERHUB_CREDS = credentials('dockerhub-creds')
  }

  stages {
    //1. Checkout
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    //2. Build
    stage('Build') {
      steps {
        //Install dependencies
        bat 'npm ci'
      }
    }

    //3. Test
    stage('Test') {
      steps {
        //Run Jest tests; outputs JUnit XML to ./junit.xml
        bat 'npm test'
        //Publish test results to Jenkins
        junit 'junit.xml'
      }
    }

    //4. Code Quality
    stage('Code Quality') {
      steps {
        //Run ESLint; if any errors, ESLint exits non-zero and fails the build
        bat 'npm run lint'
      }
    }

    //5. Security
    stage('Security') {
      steps {
        bat 'npm audit --audit-level=high'
      }
      post {
        always {
          archiveArtifacts artifacts: 'npm-audit*.*', allowEmptyArchive: true
        }
      }
    }

    //6. Deploy (Docker build + run)
    stage('Deploy') {
      steps {
        //Build Docker image, tag with build number
        bat 'docker build -t myapp:%BUILD_NUMBER% .'

        bat 'docker run -d --rm -p 3000:3000 --name myapp-%BUILD_NUMBER% myapp:%BUILD_NUMBER%'
      }
    }

    //7. Release (Push to Docker Hub)
    stage('Release') {
      steps {
        //Log in to Docker Hub using stored credentials
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          bat 'echo %DH_PASS% | docker login -u %DH_USER% --password-stdin'
          bat 'docker tag myapp:%BUILD_NUMBER% %DH_USER%/myapp:latest'
          bat 'docker push  %DH_USER%/myapp:latest'
        }
      }
    }


    //8. Monitoring (Basic health check)
    stage('Monitoring') {
      steps {
        bat 'timeout /t 5'

        bat 'powershell -Command "(Invoke-WebRequest -UseBasicParsing http://localhost:3000/health).StatusCode -eq 200"'
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed—check logs for errors.'
    }
  }
}
