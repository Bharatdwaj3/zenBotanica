update_settings(max_parallel_updates=1)
k8s_kind('Rollout', image_json_path='{.spec.template.spec.containers[*].image}')

k8s_yaml(local('kubectl kustomize k8s/kam-bomsai', quiet=True))

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
    dockerfile='gardeners/Dockerfile.dev',
    live_update=[
        sync('gardeners/package.json', '/app/package.json'),
        sync('gardeners', '/app'),
        run('npm install --legacy-peer-deps', trigger=['gardeners/package.json']),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-marketplace', 'marketplace',
    dockerfile='marketplace/Dockerfile.dev',
    live_update=[
        sync('marketplace/package.json', '/app/package.json'),
        sync('marketplace', '/app'),
        run('npm install --legacy-peer-deps', trigger=['marketplace/package.json']),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-tending', 'tending',
    dockerfile='tending/Dockerfile.dev',
    live_update=[
        sync('tending/package.json', '/app/package.json'),
        sync('tending', '/app'),
        run('npm install --legacy-peer-deps', trigger=['tending/package.json']),
    ],
)
docker_build(
    'ghcr.io/bharatdwaj3/botany-visitor-services', 'visitor-services',
    dockerfile='visitor-services/Dockerfile.dev',
    live_update=[
        sync('visitor-services/package.json', '/app/package.json'),
        sync('visitor-services', '/app'),
        run('npm install --legacy-peer-deps', trigger=['visitor-services/package.json']),
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

k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/dev-tls-secret.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/gardeners-secrets.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/ghcr-secret.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/grove-secrets.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/marketplace-secrets.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/tending-secrets.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/visitor-services-secrets.sops.yaml', quiet=True))
k8s_yaml(local('/usr/local/bin/sops -d infra/dev/secrets/kam-tls-secret.sops.yaml', quiet=True))
