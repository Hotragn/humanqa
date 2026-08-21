# Website deployment

The HumanQA website is a static multi-page build. It does not require a database, Kubernetes, or a long-running application server.

## Supported paths

- **Managed static hosting:** the current public site uses Vercel, and the repository also carries Sites project metadata. This is the simplest path for previews, TLS, and CDN delivery.
- **GitHub Pages or another static host:** publish the contents of `apps/site/dist` after `pnpm --filter @humanqa/site build`. Configure the host to serve `/docs/index.html` for `/docs/`.
- **Container:** build `apps/site/Dockerfile` from the repository root. The runtime is an unprivileged Nginx image serving on port 8080 with a `/healthz` endpoint.
- **Kubernetes:** `deploy/kubernetes/humanqa-site.yaml` supplies two replicas, health probes, resource bounds, no service-account token, a read-only root filesystem, and a ClusterIP service. Add an Ingress or Gateway and TLS policy appropriate to the cluster.

```bash
docker build -f apps/site/Dockerfile -t humanqa-site:local .
docker run --rm -p 8080:8080 humanqa-site:local
curl http://127.0.0.1:8080/healthz
```

```bash
kubectl apply --dry-run=server -f deploy/kubernetes/humanqa-site.yaml
kubectl apply -f deploy/kubernetes/humanqa-site.yaml
```

Kubernetes itself is not free hosting; it adds a cluster, ingress, certificates, upgrades, monitoring, and on-call responsibility. Use it when HumanQA must fit an existing cluster or policy boundary, not to host a small static site more cheaply.

Release publication builds `ghcr.io/hotragn/humanqa-site:<version>` with provenance and an SBOM. Review and pin the image digest in production environments.
