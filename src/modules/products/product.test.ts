import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { productService } from "./product.service";

describe("ProductService", () => {
  let testProductId = "";

  it("should generate a unique ID", () => {
    const id1 = productService.generateId();
    const id2 = productService.generateId();
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(10);
  });

  it("should create a new product", async () => {
    const initialProducts = await productService.getAllProducts();
    const initialCount = initialProducts.length;

    const newProduct = await productService.createProduct(
      "Test Product " + Date.now(),
      99.99,
      "piece",
      null
    );

    expect(newProduct).toBeDefined();
    expect(newProduct.id).toBeDefined();
    testProductId = newProduct.id;

    const afterProducts = await productService.getAllProducts();
    expect(afterProducts.length).toBe(initialCount + 1);
  });

  it("should get a product by ID", async () => {
    const product = await productService.getProductById(testProductId);
    expect(product).toBeDefined();
    expect(product?.id).toBe(testProductId);
  });

  it("should search products by name", async () => {
    const results = await productService.searchProducts("Test Product");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(p => p.id === testProductId)).toBeTrue();
  });

  it("should update a product", async () => {
    const updatedName = "Updated Test Product";
    const updatedProduct = await productService.updateProduct(
      testProductId,
      updatedName,
      150.0,
      "kg",
      null
    );

    expect(updatedProduct).toBeDefined();
    expect(updatedProduct?.name).toBe(updatedName);
    expect(updatedProduct?.price).toBe(150.0);
    expect(updatedProduct?.unit).toBe("kg");

    const fetchedProduct = await productService.getProductById(testProductId);
    expect(fetchedProduct?.name).toBe(updatedName);
  });

  it("should delete a product", async () => {
    const initialProducts = await productService.getAllProducts();
    const initialCount = initialProducts.length;

    const deleted = await productService.deleteProduct(testProductId);
    expect(deleted).toBeTrue();

    const afterProducts = await productService.getAllProducts();
    expect(afterProducts.length).toBe(initialCount - 1);

    const fetchedProduct = await productService.getProductById(testProductId);
    expect(fetchedProduct).toBeUndefined();
  });
});
