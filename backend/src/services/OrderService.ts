import { AppDataSource } from '../config/database';
import { Order, OrderStatus, PaymentMethod } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { CartService } from './CartService';
import { ProductService } from './ProductService';

const repo = () => AppDataSource.getRepository(Order);
const cartService = new CartService();
const productService = new ProductService();

export class OrderService {
  async getUserOrders(userId: string): Promise<Order[]> {
    return repo().find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string, userId: string): Promise<Order> {
    const order = await repo().findOne({ where: { id, userId } });
    if (!order) throw new Error('Commande introuvable');
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return repo().find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async createFromCart(
    userId: string,
    shippingAddress: string,
    paymentMethod: PaymentMethod = 'cash_on_delivery',
    notes?: string,
  ): Promise<Order> {
    const cart = await cartService.getCart(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Le panier est vide');
    }

    // Vérifier les stocks
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour "${item.product.name}" (disponible: ${item.product.stock})`);
      }
    }

    // Snapshot des lignes de commande
    const orderItems: Partial<OrderItem>[] = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.product.price),
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity!,
      0,
    );

    const order = repo().create({
      userId,
      shippingAddress,
      paymentMethod,
      notes,
      totalAmount,
      items: orderItems as OrderItem[],
    });

    const saved = await repo().save(order);

    // Décrémenter les stocks
    for (const item of cart.items) {
      await productService.updateStock(item.productId, -item.quantity);
    }

    // Vider le panier
    await cartService.clearCart(userId);

    return saved;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await repo().findOne({ where: { id } });
    if (!order) throw new Error('Commande introuvable');
    order.status = status;
    return repo().save(order);
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.getOrderById(id, userId);

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Cette commande ne peut plus être annulée');
    }

    // Remettre les stocks
    for (const item of order.items) {
      await productService.updateStock(item.productId, item.quantity);
    }

    order.status = 'cancelled';
    return repo().save(order);
  }
}
