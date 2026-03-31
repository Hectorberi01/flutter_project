import { AppDataSource } from '../config/database';
import { Favorite } from '../entities/Favorite';
import { ProductService } from './ProductService';

const repo = () => AppDataSource.getRepository(Favorite);
const productService = new ProductService();

export class FavoriteService {
  async getUserFavorites(userId: string) {
    return repo().find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async toggle(userId: string, productId: string) {
    await productService.findById(productId);

    const existing = await repo().findOne({ where: { userId, productId } });

    if (existing) {
      await repo().remove(existing);
      return { added: false, message: 'Retiré des favoris' };
    }

    const fav = repo().create({ userId, productId });
    await repo().save(fav);
    return { added: true, message: 'Ajouté aux favoris' };
  }

  async isFavorite(userId: string, productId: string) {
    const fav = await repo().findOne({ where: { userId, productId } });
    return !!fav;
  }

  async remove(userId: string, favoriteId: string) {
    const fav = await repo().findOne({ where: { id: favoriteId, userId } });
    if (!fav) throw new Error('Favori introuvable');
    await repo().remove(fav);
  }
}
