export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  _count: { orders: number };
}
