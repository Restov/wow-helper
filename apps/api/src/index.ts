import { createApp } from "./app";

const port = Number(Bun.env.PORT ?? 3000);


const app = createApp().listen(port);

console.log(`API is running at http://${app.server?.hostname}:${app.server?.port}`);
