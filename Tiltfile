k8s_kind('Rollout', image_json_path='{.spec.template.spec.containers[*].image}')

# Render the chart, then drop any SealedSecret objects it defines.

# Render Kustomize overlay for bonsai-dev, then drop any SealedSecret objects.
# Secrets for bonsai-dev are managed separately via SOPS in infra/dev/secrets/
rendered = local('kubectl kustomize k8s/overlays/dev', quiet=True)

objects = decode_yaml_stream(rendered)
objects = [o for o in objects if o.get('kind') != 'SealedSecret']
k8s_yaml(encode_yaml_stream(objects))

docker_build(
    'ghcr.io/bharatdwaj3/botany-grove', 'grove',
    dockerfile='grove/Dockerfile.dev',
    live_update=[
        sync('grove/package.json', '/app/package.json'),
        sync('grove', '/app'),
        run('npm install --legacy-peer-deps', trigger=['grove/package.json']),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-gardeners', 'gardeners',
    live_update=[
        sync('gardeners', '/app'),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-marketplace', 'marketplace',
    live_update=[
        sync('marketplace', '/app'),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-tending', 'tending',
    live_update=[
        sync('tending', '/app'),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-visitor-services', 'visitor-services',
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

k8s_resource('grove', port_forwards='9001:4001')
k8s_resource('gardeners', port_forwards='9003:4003')
k8s_resource('marketplace', port_forwards='9005:4005')
k8s_resource('tending', port_forwards='9002:4002')
k8s_resource('visitor-services', port_forwards='9004:4004')
k8s_resource('frontend', port_forwards='9010:80')

for f in listdir("infra/dev/secrets"):
    if f.endswith(".sops.yaml"):
        k8s_yaml(local("/usr/local/bin/sops -d " + f, quiet=True))
