k8s_kind('Rollout', image_json_path='{.spec.template.spec.containers[*].image}')

# Render the chart, then drop any SealedSecret objects it defines.
# Secrets for bonsai-dev are managed separately, in infra/dev/secrets/,
# so the chart's own (bonsai-scoped) secret templates must never be applied here.
rendered = local(
    'helm template bonsai-dev infra/helm/bonsai-services --namespace bonsai-dev --values infra/helm/bonsai-services/values-dev.yaml',
    quiet=True,
)
watch_file('infra/helm/bonsai-services')

objects = decode_yaml_stream(rendered)
objects = [o for o in objects if o.get('kind') != 'SealedSecret']
k8s_yaml(encode_yaml_stream(objects))

# Load the restart_process extension correctly
load('ext://restart_process', 'docker_build_with_restart')

docker_build_with_restart(
    'ghcr.io/bharatdwaj3/botany-grove', 'grove',
    entrypoint='npm run dev', # <-- REPLACE THIS with your actual start command (e.g., 'tsx server.ts' or 'npm start')
    dockerfile='grove/Dockerfile.dev',
    live_update=[
        sync('grove/package.json', '/app/package.json'),
        sync('grove', '/app'),
        run('npm install --legacy-peer-deps', trigger=['grove/package.json']),
    ],
)

docker_build_with_restart(
    'ghcr.io/bharatdwaj3/botany-gardeners', 'gardeners',
    entrypoint='npm run dev', # <-- REPLACE THIS
    live_update=[
        sync('gardeners', '/app'),
    ],
)

docker_build_with_restart(
    'ghcr.io/bharatdwaj3/botany-marketplace', 'marketplace',
    entrypoint='npm run dev', # <-- REPLACE THIS
    live_update=[
        sync('marketplace', '/app'),
    ],
)

docker_build_with_restart(
    'ghcr.io/bharatdwaj3/botany-tending', 'tending',
    entrypoint='npm run dev', # <-- REPLACE THIS
    live_update=[
        sync('tending', '/app'),
    ],
)

docker_build_with_restart(
    'ghcr.io/bharatdwaj3/botany-visitor-services', 'visitor-services',
    entrypoint='npm run dev', # <-- REPLACE THIS
    live_update=[
        sync('visitor-services', '/app'),
    ],
)

docker_build(
    'ghcr.io/bharatdwaj3/botany-frontend', 'frontend',
    live_update=[
        sync('frontend', '/app'),
    ],
)

k8s_resource('grove', port_forwards=9001)
k8s_resource('gardeners', port_forwards=9003)
k8s_resource('marketplace', port_forwards=9005)
k8s_resource('tending', port_forwards=9002)
k8s_resource('visitor-services', port_forwards=9004)
k8s_resource('frontend', port_forwards=9010)

k8s_yaml(listdir("infra/dev/secrets"))
