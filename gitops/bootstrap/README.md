# GitOps Bootstrap

This script restores the core Kubernetes operators and GitOps state for the HonKhana project.

## Prerequisites
- A running Kind cluster
- The GHCR_PAT environment variable must be set.
- Working Directory: This script must be executed from the root of the repository where the per-service .env files are located.

## Usage
export GHCR_PAT=your_github_personal_access_token
./gitops/bootstrap/bootstrap.sh
