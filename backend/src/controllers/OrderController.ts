import { Response } from 'express';
import { OrderService } from '../services/OrderService';
import { AuthRequest } from '../middleware/auth';

const service = new OrderService();

export class OrderController {
  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      res.json(await service.getUserOrders(req.user!.id));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      res.json(await service.getOrderById(req.params.id, req.user!.id));
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  }

  async getAllOrders(_req: AuthRequest, res: Response) {
    try {
      res.json(await service.getAllOrders());
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  }

  async checkout(req: AuthRequest, res: Response) {
    try {
      const { shippingAddress, paymentMethod, notes } = req.body;
      if (!shippingAddress) {
        return res.status(400).json({ message: 'shippingAddress requis' });
      }
      const order = await service.createFromCart(
        req.user!.id,
        shippingAddress,
        paymentMethod,
        notes,
      );
      res.status(201).json(order);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'status requis' });
      res.json(await service.updateStatus(req.params.id, status));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async cancel(req: AuthRequest, res: Response) {
    try {
      res.json(await service.cancelOrder(req.params.id, req.user!.id));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }
}
