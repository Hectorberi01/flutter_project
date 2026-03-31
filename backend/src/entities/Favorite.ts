import {
  Entity, PrimaryGeneratedColumn, ManyToOne,
  CreateDateColumn, JoinColumn, Column, Unique,
} from 'typeorm';
import { User } from './User';
import { Product } from './Product';

@Entity('favorites')
@Unique(['userId', 'productId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Product, (product) => product.favorites, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @CreateDateColumn()
  createdAt: Date;
}
