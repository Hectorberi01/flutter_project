import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const repo = () => AppDataSource.getRepository(User);

export class UserService {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const exists = await repo().findOne({ where: { email: data.email } });
    if (exists) throw new Error('Email déjà utilisé');

    const user = repo().create(data);
    await repo().save(user);
    return user;
  }

  async login(email: string, password: string) {
    const user = await repo()
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) throw new Error('Identifiants invalides');

    const valid = await user.comparePassword(password);
    if (!valid) throw new Error('Identifiants invalides');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any,
    );

    return { token, user };
  }

  async findAll() {
    return repo().find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const user = await repo().findOne({ where: { id } });
    if (!user) throw new Error('Utilisateur introuvable');
    return user;
  }

  async update(id: string, data: Partial<Pick<User, 'name' | 'phone' | 'address'>>) {
    await repo().update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    const user = await this.findById(id);
    await repo().remove(user);
  }
}
