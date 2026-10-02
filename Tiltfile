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

docker_build(
    'ghcr.io/bharatdwaj3/botany-grove', 'grove',
    dockerfile='grove/Dockerfile.dev',
    live_update=[
        sync('grove/package.json', '/app/package.json'),
        sync('grove', '/app'),
        run('npm install --legacy-peer-deps', trigger=['grove/package.json']),
    ],
)
docker_build('ghcr.io/bharatdwaj3/botany-gardeners', 'gardeners')
docker_build('ghcr.io/bharatdwaj3/botany-marketplace', 'marketplace')
docker_build('ghcr.io/bharatdwaj3/botany-tending', 'tending')
docker_build('ghcr.io/bharatdwaj3/botany-visitor-services', 'visitor-services')
docker_build('ghcr.io/bharatdwaj3/botany-frontend', 'frontend')

k8s_resource('grove', port_forwards=9001)
k8s_resource('gardeners', port_forwards=9003)
k8s_resource('marketplace', port_forwards=9005)
k8s_resource('tending', port_forwards=9002)
k8s_resource('visitor-services', port_forwards=9004)
k8s_resource('frontend', port_forwards=9010)

k8s_yaml(listdir("infra/dev/secrets"))
k8s_yaml(listdir("infra/dev/routes"))
