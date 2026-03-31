import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middleware/auth';

const service = new UserService();

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const user = await service.register(req.body);
      res.status(201).json({ message: 'Compte créé avec succès', user });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await service.login(email, password);
      res.json(result);
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    res.json(req.user);
  }

  async updateMe(req: AuthRequest, res: Response) {
    try {
      const user = await service.update(req.user!.id, req.body);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const users = await service.findAll();
    res.json(users);
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await service.findById(req.params.id);
      res.json(user);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
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
