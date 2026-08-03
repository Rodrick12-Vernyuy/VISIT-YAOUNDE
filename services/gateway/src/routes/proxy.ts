import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const proxyRouter = Router();

type PathFilter = string | ((pathname: string) => boolean);

// Using http-proxy-middleware's own pathFilter (rather than Express's
// `router.use(path, ...)`) is deliberate: Express strips the matched prefix
// from req.url before the middleware ever sees it, which would forward
// truncated paths like "/?pageSize=3" instead of "/api/v1/attractions?..."
// to the downstream service. pathFilter matches without stripping anything.
function proxy(pathFilter: PathFilter, target: string) {
  return createProxyMiddleware({
    pathFilter,
    target,
    changeOrigin: true,
    on: {
      error: (err, _req, res) => {
        logger.error(`Proxy error forwarding to ${target}: ${err.message}`);
        if ('writeHead' in res) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Upstream service unavailable' }));
        }
      },
    },
  });
}

// Order matters: more specific filters must be registered before broader
// ones, since Express walks middleware in registration order and a broad
// prefix match would otherwise swallow requests meant for a narrower route.
proxyRouter.use(proxy('/api/v1/auth', env.services.auth));
proxyRouter.use(
  proxy((path) => /^\/api\/v1\/attractions\/[^/]+\/reviews/.test(path), env.services.engagement)
);
proxyRouter.use(proxy('/api/v1/attractions', env.services.attractions));
proxyRouter.use(proxy('/api/v1/categories', env.services.attractions));
proxyRouter.use(proxy('/api/v1/reviews', env.services.engagement));
proxyRouter.use(proxy('/api/v1/favorites', env.services.engagement));
proxyRouter.use(proxy('/uploads', env.services.attractions));
