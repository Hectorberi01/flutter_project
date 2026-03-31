import { Response } from 'express';
import { FavoriteService } from '../services/FavoriteService';
import { AuthRequest } from '../middleware/auth';

const service = new FavoriteService();

export class FavoriteController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      res.json(await service.getUserFavorites(req.user!.id));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  }

  async toggle(req: AuthRequest, res: Response) {
    try {
      res.json(await service.toggle(req.user!.id, req.params.productId));
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async remove(req: AuthRequest, res: Response) {
    try {
      await service.remove(req.user!.id, req.params.id);
      res.status(204).send();
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  }
}
