import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToMany, OneToOne, BeforeInsert,
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { Cart } from './Cart';
import { Order } from './Order';
import { Favorite } from './Favorite';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Un utilisateur possède un seul panier actif
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Favorite, (fav) => fav.user)
  favorites: Favorite[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }

  toJSON() {
    const { password, ...rest } = this as any;
    return rest;
  }
}
