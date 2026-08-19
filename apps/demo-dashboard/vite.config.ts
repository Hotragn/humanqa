import { defineConfig, type Plugin } from "vite";

function fixtureApi(mode: string): Plugin {
  const broken = mode !== "fixed";
  return {
    name: "humanqa-fixture-api",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.startsWith("/api/fail")) {
          response.statusCode = broken ? 503 : 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(broken ? { error: "Seeded fixture failure" } : { ok: true }));
          return;
        }
        if (request.url?.startsWith("/broken-link")) {
          response.statusCode = broken ? 404 : 204;
          response.end();
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [fixtureApi(mode)],
  define: {
    __FIXTURE_MODE__: JSON.stringify(mode === "fixed" ? "fixed" : "broken")
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  }
}));
