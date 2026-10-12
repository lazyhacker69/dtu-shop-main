// models/index.ts
export { default as User } from './User';
export { default as Category } from './Category';
export { default as Product } from './Product';
export { default as Cart } from './Cart';
export { default as Order } from './Order';
export { default as Review } from './Review';

export type { IUser } from './User';
export type { ICategory } from './Category';
export type { IProduct, IProductVariant } from './Product';
export type { ICart, ICartItem } from './Cart';
export type { IOrder, IOrderItem } from './Order';
export type { IReview } from './Review';
