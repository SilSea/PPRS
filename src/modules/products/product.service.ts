import { file, write } from "bun";
import path from "path";
import { unlink } from "node:fs/promises";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
}

const dbPath = path.join(import.meta.dir, "../../data/db.json");
const publicImagesDir = path.join(process.cwd(), "public/images");

export class ProductService {
  private lock: Promise<void> = Promise.resolve();

  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const prev = this.lock;
    this.lock = new Promise(resolve => { release = resolve; });
    await prev;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  private async getProducts(): Promise<Product[]> {
    try {
      const f = file(dbPath);
      if (!(await f.exists())) return [];
      const data = await f.json();
      return data.products || [];
    } catch (e) {
      return [];
    }
  }

  private async saveProducts(products: Product[]) {
    await write(dbPath, JSON.stringify({ products }, null, 2));
  }

  public async getAllProducts(): Promise<Product[]> {
    return this.getProducts();
  }

  public async searchProducts(keyword: string): Promise<Product[]> {
    const products = await this.getProducts();
    const lowerKeyword = keyword.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        p.id.toLowerCase().includes(lowerKeyword)
    );
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  }

  public generateId(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    const rand = Math.random().toString(36).substring(2, 6);
    return `${yyyy}${mm}${dd}${hh}${min}${ss}${ms}${rand}`;
  }

  public async createProduct(
    name: string,
    price: number,
    unit: string,
    imageFile: File | null
  ): Promise<Product> {
    return this.withLock(async () => {
      const products = await this.getProducts();
      const id = this.generateId();
      let imageFilename = "";

      if (imageFile && imageFile.size > 0) {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        if (imageFile.size > MAX_IMAGE_SIZE) {
          throw new Error("Image too large");
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
          throw new Error("Invalid image type");
        }
        const ext = path.extname(imageFile.name) || ".jpg";
        imageFilename = `${id}${ext}`;
        const buf = await imageFile.arrayBuffer();
        await write(path.join(publicImagesDir, imageFilename), buf);
      }

      const newProduct: Product = {
        id,
        name,
        price,
        unit,
        image: imageFilename,
      };

      products.push(newProduct);
      await this.saveProducts(products);
      return newProduct;
    });
  }

  public async updateProduct(
    id: string,
    name: string,
    price: number,
    unit: string,
    imageFile: File | null
  ): Promise<Product | null> {
    return this.withLock(async () => {
      const products = await this.getProducts();
      const index = products.findIndex((p) => p.id === id);
      
      if (index === -1) return null;

      const existingProduct = products[index];
      let imageFilename = existingProduct.image;

      if (imageFile && imageFile.size > 0) {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        if (imageFile.size > MAX_IMAGE_SIZE) {
          throw new Error("Image too large");
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
          throw new Error("Invalid image type");
        }

        if (existingProduct.image) {
          try {
            await unlink(path.join(publicImagesDir, existingProduct.image));
          } catch (e) {}
        }

        const ext = path.extname(imageFile.name) || ".jpg";
        imageFilename = `${id}${ext}`;
        const buf = await imageFile.arrayBuffer();
        await write(path.join(publicImagesDir, imageFilename), buf);
      }

      products[index] = {
        ...existingProduct,
        name,
        price,
        unit,
        image: imageFilename,
      };

      await this.saveProducts(products);
      return products[index];
    });
  }

  public async deleteProduct(id: string): Promise<boolean> {
    return this.withLock(async () => {
      let products = await this.getProducts();
      const existingProduct = products.find((p) => p.id === id);
      
      if (!existingProduct) return false;

      products = products.filter((p) => p.id !== id);

      if (existingProduct.image) {
        try {
          await unlink(path.join(publicImagesDir, existingProduct.image));
        } catch (e) {}
      }

      await this.saveProducts(products);
      return true;
    });
  }
}

export const productService = new ProductService();
