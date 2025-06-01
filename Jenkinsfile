pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        echo 'Installing dependencies...'
        bat 'npm install'
        echo 'Build complete.'
      }
    }
  }
}

