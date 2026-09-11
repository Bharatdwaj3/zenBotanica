#!/usr/bin/env bash
set -euo pipefail

echo "=== 1. Confirming kubeconfig points at the current Kind cluster ==="
kind export kubeconfig --name kind
kubectl cluster-info

echo "=== 2. Namespaces (idempotent) ==="
for ns in bonsai argocd argo-rollouts cnpg-system; do
  kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f -
done

echo "=== 3. Operators: CloudNativePG, Argo Rollouts, Argo CD (server-side, avoids the annotation-size error) ==="
kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.25/releases/cnpg-1.25.0.yaml
kubectl apply --server-side -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/download/v1.7.2/install.yaml
kubectl apply --server-side -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/manifests/v2.11.0/install.yaml

echo "=== 4. Waiting for operator pods to be ready ==="
kubectl wait --for=condition=Ready pods --all -n cnpg-system --timeout=120s || true
kubectl wait --for=condition=Ready pods --all -n argo-rollouts --timeout=120s || true
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=180s || true

echo "=== 5. GHCR image pull secret (idempotent, reads token from env var, never hardcoded) ==="
if [ -z "${GHCR_PAT:-}" ]; then
  echo "GHCR_PAT is not set. Export it first: export GHCR_PAT=your_token_here"
  exit 1
fi
kubectl create secret docker-registry ghcr-secret \
  --namespace bonsai \
  --docker-server=https://ghcr.io \
  --docker-username=bharatdwaj3 \
  --docker-password="$GHCR_PAT" \
  --docker-email=your-email@example.com \
  --dry-run=client -o yaml | kubectl apply -f -

echo "=== 6. Per-service DB secrets (idempotent, reads real passwords from each service's own .env — never typed here) ==="
for svc in grove gardeners marketplace tending visitor-services; do
  ENV_FILE="./${svc}/.env"
  if [ ! -f "$ENV_FILE" ]; then
    echo "Missing $ENV_FILE, skipping $svc secret"
    continue
  fi
  PG_USER=$(grep '^PgSql_User=' "$ENV_FILE" | cut -d= -f2)
  PG_PASS=$(grep '^PgSql_Password=' "$ENV_FILE" | cut -d= -f2)
  PG_DB=$(grep '^PgSql_Database=' "$ENV_FILE" | cut -d= -f2)
  kubectl create secret generic "${svc}-secrets" \
    --namespace bonsai \
    --from-literal=PgSql_User="$PG_USER" \
    --from-literal=PgSql_Password="$PG_PASS" \
    --from-literal=PgSql_Database="$PG_DB" \
    --from-literal=username="$PG_USER" \
    --from-literal=password="$PG_PASS" \
    --from-literal=PgSql_Host="${svc}-db-rw" \
    --dry-run=client -o yaml | kubectl apply -f -
done

echo "=== 7. CloudNativePG Cluster resources for all 5 databases (idempotent) ==="
for svc in grove gardeners marketplace tending visitor-services; do
  ENV_FILE="./${svc}/.env"
  PG_USER=$(grep '^PgSql_User=' "$ENV_FILE" | cut -d= -f2)
  PG_DB=$(grep '^PgSql_Database=' "$ENV_FILE" | cut -d= -f2)
  cat <<EOF | kubectl apply -f -
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: ${svc}-db
  namespace: bonsai
spec:
  instances: 1
  storage:
    size: 100Mi
  bootstrap:
    initdb:
      database: ${PG_DB}
      owner: ${PG_USER}
      secret:
        name: ${svc}-secrets
EOF
done

echo "=== 8. Argo CD Application (idempotent) ==="
cat <<EOF | kubectl apply -f -
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: honkhana-services
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/bharatdwaj3/honkhana.git
    targetRevision: HEAD
    path: k8s/services
  destination:
    server: https://kubernetes.default.svc
    namespace: bonsai
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF

echo "=== Bootstrap complete. Verifying ==="
kubectl get cluster -n bonsai
kubectl get application honkhana-services -n argocd
kubectl get pods -n bonsai
