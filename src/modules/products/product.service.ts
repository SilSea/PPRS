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
    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  }

  public async createProduct(
    name: string,
    price: number,
    unit: string,
    imageFile: File | null
  ): Promise<Product> {
    const products = await this.getProducts();
    const id = this.generateId();
    let imageFilename = "";

    if (imageFile && imageFile.size > 0) {
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
  }

  public async updateProduct(
    id: string,
    name: string,
    price: number,
    unit: string,
    imageFile: File | null
  ): Promise<Product | null> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    
    if (index === -1) return null;

    const existingProduct = products[index];
    let imageFilename = existingProduct.image;

    // ถ้ามีการอัพโหลดภาพไปก็ทับภาพเดิมชื่อเดิมห้ามแก้รหัสสินค้า
    if (imageFile && imageFile.size > 0) {
      const ext = path.extname(imageFile.name) || ".jpg";
      // ถ้าเดิมมีภาพอยู่แล้ว ให้ใช้ชื่อเดิม หรือถ้าจะให้ชื่อเป็นรหัสเสมอ
      imageFilename = existingProduct.image ? existingProduct.image : `${id}${ext}`;
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
  }

  public async deleteProduct(id: string): Promise<boolean> {
    let products = await this.getProducts();
    const existingProduct = products.find((p) => p.id === id);
    
    if (!existingProduct) return false;

    products = products.filter((p) => p.id !== id);

    // ลบไฟล์รูปภาพ
    if (existingProduct.image) {
      try {
        await unlink(path.join(publicImagesDir, existingProduct.image));
      } catch (e) {
        // ignore errors if file already deleted
      }
    }

    await this.saveProducts(products);
    return true;
  }
}

export const productService = new ProductService();
