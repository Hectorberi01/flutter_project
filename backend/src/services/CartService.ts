import { AppDataSource } from '../config/database';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { ProductService } from './ProductService';

const cartRepo = () => AppDataSource.getRepository(Cart);
const itemRepo = () => AppDataSource.getRepository(CartItem);
const productService = new ProductService();

export class CartService {
  // Récupère ou crée le panier de l'utilisateur
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await cartRepo().findOne({ where: { userId } });
    if (!cart) {
      cart = cartRepo().create({ userId, items: [], total: 0 });
      await cartRepo().save(cart);
    }
    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    await productService.findById(productId); // vérifie existence

    const cart = await this.getOrCreateCart(userId);

    let item = await itemRepo().findOne({ where: { cartId: cart.id, productId } });

    if (item) {
      item.quantity += quantity;
      await itemRepo().save(item);
    } else {
      item = itemRepo().create({ cartId: cart.id, productId, quantity });
      await itemRepo().save(item);
    }

    return this.refreshTotal(cart.id);
  }

  async updateItem(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = await itemRepo().findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new Error('Article introuvable dans le panier');

    if (quantity <= 0) {
      await itemRepo().remove(item);
    } else {
      item.quantity = quantity;
      await itemRepo().save(item);
    }

    return this.refreshTotal(cart.id);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = await itemRepo().findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new Error('Article introuvable dans le panier');
    await itemRepo().remove(item);
    return this.refreshTotal(cart.id);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await cartRepo().findOne({ where: { userId } });
    if (cart) {
      await itemRepo().delete({ cartId: cart.id });
      cart.total = 0;
      await cartRepo().save(cart);
    }
  }

  private async refreshTotal(cartId: string): Promise<Cart> {
    const cart = await cartRepo().findOne({ where: { id: cartId } });
    if (!cart) throw new Error('Panier introuvable');
    cart.recalculateTotal();
    return cartRepo().save(cart);
  }
}
