import { createApp } from "./app";

const port = Number(Bun.env.PORT ?? 3000);
const hostname = Bun.env.HOST ?? "0.0.0.0";

const app = createApp().listen({ hostname, port });

console.log(`API is running at http://${app.server?.hostname}:${app.server?.port}`);
