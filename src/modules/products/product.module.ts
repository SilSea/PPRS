import { Elysia } from "elysia";
import { productController } from "./product.controller";

export const ProductModule = new Elysia()
  .use(productController);
