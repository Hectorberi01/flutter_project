import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn,
  JoinColumn, BeforeInsert,
} from 'typeorm';
import { User } from './User';
import { OrderItem } from './OrderItem';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'mobile_money' | 'card' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Référence lisible : ORD-20250101-XXXX
  @Column({ unique: true, length: 30 })
  reference: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'varchar', default: 'unpaid' })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', default: 'cash_on_delivery' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateReference() {
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.reference = `ORD-${datePart}-${rand}`;
  }
}
