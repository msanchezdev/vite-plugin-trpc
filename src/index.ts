import { PluginOption } from 'vite';
import {
  NodeHTTPHandlerOptions,
  NodeHTTPRequest,
  nodeHTTPRequestHandler,
  NodeHTTPResponse,
} from '@trpc/server/adapters/node-http';
import { AnyRouter } from '@trpc/server';

type TrpcPluginOptions<
  TRouter extends AnyRouter,
  TRequest extends NodeHTTPRequest,
  TResponse extends NodeHTTPResponse,
> = {
  /**
   * Path where the trpc router will be mounted.
   * @default '/trpc'
   */
  basePath: string;
} & NodeHTTPHandlerOptions<TRouter, TRequest, TResponse>;

export default function trpc<
  TRouter extends AnyRouter,
  TRequest extends NodeHTTPRequest,
  TResponse extends NodeHTTPResponse,
>(options: TrpcPluginOptions<TRouter, TRequest, TResponse>): PluginOption {
  return {
    name: 'trpc',
    configureServer(server) {
      server.middlewares.use(options?.basePath || '/trpc', (req, res) => {
        const url = new URL(req.url || '/', 'http://localhost');
        const path = url.pathname.replace(/^\//, '');

        return nodeHTTPRequestHandler({
          req: req as TRequest,
          res: res as TResponse,
          path,
          router: options.router,
          createContext: options.createContext,
          batching: options.batching,
          responseMeta: options.responseMeta,
          maxBodySize: options.maxBodySize,
          onError: options.onError,
        });
      });
    },
  };
}
