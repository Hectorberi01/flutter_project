import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

const service = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const result = await service.findAll({
        category: req.query.category as string,
        search: req.query.search as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      res.json(await service.findById(req.params.id));
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      res.status(201).json(await service.create(req.body));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      res.json(await service.update(req.params.id, req.body));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.delete(req.params.id);
      res.status(204).send();
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  }
}
