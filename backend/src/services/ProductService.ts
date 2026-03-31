import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { ILike } from 'typeorm';

const repo = () => AppDataSource.getRepository(Product);

export class ProductService {
  async findAll(query: { category?: string; search?: string; page?: number; limit?: number }) {
    const { category, search, page = 1, limit = 20 } = query;
    const where: any = { isActive: true };

    if (category) where.category = category;
    if (search) where.name = ILike(`%${search}%`);

    const [products, total] = await repo().findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { products, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const product = await repo().findOne({ where: { id, isActive: true } });
    if (!product) throw new Error('Produit introuvable');
    return product;
  }

  async create(data: Partial<Product>) {
    const product = repo().create(data);
    return repo().save(product);
  }

  async update(id: string, data: Partial<Product>) {
    await this.findById(id);
    await repo().update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.findById(id);
    await repo().update(id, { isActive: false }); // soft delete
  }

  async updateStock(id: string, delta: number) {
    const product = await repo().findOne({ where: { id } });
    if (!product) throw new Error('Produit introuvable');
    if (product.stock + delta < 0) throw new Error('Stock insuffisant');
    product.stock += delta;
    return repo().save(product);
  }
}
