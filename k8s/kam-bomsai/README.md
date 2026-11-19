# kam-bomsai (local dev lane)

Kustomize overlay on `k8s/base` for the Kind cluster, driven by Tilt.
Namespace: `kam-bomsai`. Context: `kind-kind`.

## Run it

- Start Tilt: `(nohup tilt up --stream=true > ~/tilt.log 2>&1 &)`
- Never run `tilt down`.
- Never run `kubectl apply -k` here. It overwrites the images Tilt injects.
- Reload after editing manifests: `touch Tiltfile`
- Reach the ingress: `kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 18080:80`
- Kind publishes only 6443, so ports 80 and 443 are not available.

## Files

- `kustomization.yaml`: resources and patches for the overlay
- `ingress.yaml`: one host per service, each routing `/` to its Service
- `ingress-frontend-api.yaml`: same-origin `/api/v1/*` paths on the frontend host
- `ingress-frontend-alias.yaml`: `/api/v1/tending` to session, `/api/v1/masters` to botanist
- `scale-rollouts.yaml`, `scale-statefulsets.yaml`: replicas 1
- `firebase-cache.yaml`: persists the firebase emulator cache
- `visitor-db-host.yaml`: sets `PgSql_Host` for visitor-services
- `dev-command.yaml`: runs the five backends with `npm run dev` (nodemon) so synced edits reload, and retries Prisma until cluster DNS is up

## Service ports

grove 4001, tending 4002, gardeners 4003, visitor-services 4004,
marketplace 4005, frontend 80. Tilt forwards 9001 to 9005 and 9010 (frontend).

## Notes

- `rewrite-target` is per Ingress object, so each alias has its own Ingress.
- `use-regex` on one Ingress makes every path on that host regex-matched.
- Argo Rollouts controller manifests are applied with `--server-side`.
  Its ClusterRole and ClusterRoleBinding `argo-rollouts` are cluster-wide. Never delete them.

## Known gaps

- Frontend `PUT /masters/profile/:id` has no backend route (botanist has `PUT /:id` only).
- grove `permissions.config.ts` uses admin/faculty/student, not the Role enum.
- marketplace is verified at the guard level only. No signup role holds a marketplace permission.

## Hosts

- frontend.127.0.0.1.sslip.io
- gardeners.127.0.0.1.sslip.io
- grove.127.0.0.1.sslip.io
- marketplace.127.0.0.1.sslip.io
- tending.127.0.0.1.sslip.io
- visitor-services.127.0.0.1.sslip.io

## Kept on purpose (no references found, may serve other lanes)

- `chart/`: stub Helm chart. Only `Chart.yaml` is tracked and `templates/` has no tracked files.
- `secrets/`: empty directory. Git does not track empty directories.

## Outside this folder

- `k8s/overlays/dev/kustomization.yaml`: an older dev overlay on `../../base` with namespace `kam-bomsai`, superseded by this folder. Nothing references it. It still has `not-used` placeholder patches and renames Service `visitor-services-db` to `visitor-db`. Left untouched. Do not apply it alongside this overlay.
