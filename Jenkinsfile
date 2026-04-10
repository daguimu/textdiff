pipeline {
    agent any

    parameters {
        string(name: 'DEPLOY_HOST', defaultValue: '', description: 'Deployment server IP or hostname')
        string(name: 'DEPLOY_SSH_CREDENTIAL_ID', defaultValue: '', description: 'Jenkins SSH credential ID for deployment server')
        string(name: 'DEPLOY_DIR', defaultValue: '/opt/textdiff', description: 'Deployment directory on remote server')
        string(name: 'HEALTH_URL', defaultValue: '', description: 'Health check URL, e.g. http://your-domain')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def deployHost = params.DEPLOY_HOST.trim()
                    def deployDir = params.DEPLOY_DIR.trim()
                    def deployCredentialId = params.DEPLOY_SSH_CREDENTIAL_ID.trim()

                    if (!deployHost) {
                        error("Missing DEPLOY_HOST.")
                    }
                    if (!deployCredentialId) {
                        error("Missing DEPLOY_SSH_CREDENTIAL_ID.")
                    }

                    sh "tar czf /tmp/textdiff.tar.gz --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='deploy/.env' ."

                    def remote = [:]
                    remote.name = 'deployment-server'
                    remote.host = deployHost
                    remote.user = 'root'
                    remote.port = 22
                    remote.allowAnyHosts = true

                    withCredentials([sshUserPrivateKey(credentialsId: deployCredentialId, keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'userName')]) {
                        remote.user = userName ?: 'root'
                        remote.identityFile = identity

                        sshCommand remote: remote, command: "mkdir -p ${deployDir}"
                        sshPut remote: remote, from: '/tmp/textdiff.tar.gz', into: '/tmp/'

                        sshCommand remote: remote, command: """
                            cd ${deployDir}
                            tar xzf /tmp/textdiff.tar.gz
                            rm -f /tmp/textdiff.tar.gz
                            cd deploy
                            docker compose up --build
                            nginx -s reload 2>/dev/null || true
                        """
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def healthUrl = params.HEALTH_URL.trim()
                    if (!healthUrl) {
                        error("Missing HEALTH_URL.")
                    }
                }
                retry(3) {
                    sleep 5
                    sh "curl -sf ${params.HEALTH_URL.trim()}"
                }
            }
        }
    }

    post {
        success {
            echo 'TextDiff deployed successfully.'
        }
        failure {
            echo 'Deploy failed. Check console output above for details.'
        }
        always {
            sh 'rm -f /tmp/textdiff.tar.gz'
        }
    }
}
