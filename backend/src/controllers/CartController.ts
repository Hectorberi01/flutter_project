import { Response } from 'express';
import { CartService } from '../services/CartService';
import { AuthRequest } from '../middleware/auth';

const service = new CartService();

export class CartController {
  async getCart(req: AuthRequest, res: Response) {
    try {
      res.json(await service.getCart(req.user!.id));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  }

  async addItem(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity = 1 } = req.body;
      if (!productId) return res.status(400).json({ message: 'productId requis' });
      res.status(201).json(await service.addItem(req.user!.id, productId, quantity));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async updateItem(req: AuthRequest, res: Response) {
    try {
      const cart = await service.updateItem(req.user!.id, req.params.id, req.body.quantity);
      res.json(cart);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async removeItem(req: AuthRequest, res: Response) {
    try {
      const cart = await service.removeItem(req.user!.id, req.params.id);
      res.json(cart);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  }

  async clearCart(req: AuthRequest, res: Response) {
    try {
      await service.clearCart(req.user!.id);
      res.json({ message: 'Panier vidé' });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  }
}
