import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { Favorite } from '../entities/Favorite';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Hba@Str0ng#2026',
  database: process.env.DB_NAME || 'monolith_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Product, Cart, CartItem, Order, OrderItem, Favorite],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
