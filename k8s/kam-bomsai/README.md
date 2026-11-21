# kam-bomsai (local dev lane)

Kustomize overlay on `k8s/base` for the Kind cluster, driven by Tilt.
Namespace: `kam-bomsai`. Context: `kind-kind`.

## Run it

- Start Tilt: see the Dev loop section below (an empty Docker config is needed on this host).
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
- `ingress-tools.yaml`: MailHog UI on its own host
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
- mailhog.127.0.0.1.sslip.io (MailHog UI)

## Kept on purpose (no references found, may serve other lanes)

- `chart/`: stub Helm chart. Only `Chart.yaml` is tracked and `templates/` has no tracked files.
- `secrets/`: empty directory. Git does not track empty directories.

## Outside this folder

- `k8s/overlays/dev/kustomization.yaml`: an older dev overlay on `../../base` with namespace `kam-bomsai`, superseded by this folder. Nothing references it. It still has `not-used` placeholder patches and renames Service `visitor-services-db` to `visitor-db`. Left untouched. Do not apply it alongside this overlay.

## Dev loop (observed 2026-11-20)

Start Tilt in the background with an empty Docker config. Docker's credential helper
(`docker-credential-desktop.exe`) fails on this host, which breaks image builds that
need Docker Hub metadata.

    mkdir -p "$HOME/.cache/botany-tilt"
    printf '{"auths":{}}\n' > "$HOME/.cache/botany-tilt/config.json"
    nohup env DOCKER_CONFIG="$HOME/.cache/botany-tilt" tilt up --stream=true \
      > "$HOME/.cache/botany-tilt/tilt.log" 2>&1 < /dev/null &

Never run `tilt down`. Tilt dies whenever Docker or WSL restarts, so start it again.

Automatic `live_update` did not fire for edits in `grove/` while the repo is on `/mnt/c`
(Tilt's file watcher reported no events). The cause is not fully pinned down.
Rebuild a service by hand instead:

    tilt trigger grove
    kubectl rollout status rollout/grove -n kam-bomsai --timeout=120s

The same works for gardeners, marketplace, tending, visitor-services and frontend.

## Reinstall ingress-nginx (pinned)

The cluster runs ingress-nginx controller v1.15.1. The install is not defined anywhere in
this repo. To reinstall the same release, use the tagged manifest, never `main`:

    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.15.1/deploy/static/provider/kind/deploy.yaml

Checked 2026-11-21: that manifest ships the same image digest as the running controller
(sha256:594ceea76b01c592858f803f9ff4d2cb40542cae2060410b2c95f75907d659e1).
