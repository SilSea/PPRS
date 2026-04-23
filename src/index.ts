import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { ProductModule } from "./modules/products/product.module";

const app = new Elysia()
  .use(html())
  .use(staticPlugin())
  .use(ProductModule)
  .listen(3000);

console.log(
  `🦊 PPRS Server is running at ${app.server?.hostname}:${app.server?.port}`
);
