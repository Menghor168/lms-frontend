export interface User {
  user_id: number;
  username: string;
  full_name?: string;
  email?: string;
  role_type: 'Admin' | 'Staff' | 'Member';
  staff_id?: number | null;
  member_id?: number | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Book {
  book_id: number;
  title: string;
  author?: string;
  isbn?: string;
  price?: number;
  description?: string;
  category_id?: number;
  category_name?: string;
  total_copies: number;
  available_copies: number;
  cover_url?: string;
  cover_image?: string;
  availability_status?: 'Available' | 'Borrowed' | 'Reserved';
  created_at?: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  book_count?: number;
}

export interface Member {
  member_id: number;
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  join_date: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface Staff {
  staff_id: number;
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone?: string;
  role_type: 'Admin' | 'Staff';
}

export interface Transaction {
  transaction_id: number;
  title: string;
  member_name: string;
  issue_date: string;
  return_date?: string;
  due_date?: string;
  status: 'Borrowed' | 'Returned' | 'Overdue' | 'Lost' | 'Damaged';
  fine_amount?: number;
  fine_status?: string;
  cover_image?: string;
}

export interface Fine {
  fine_id: number;
  transaction_id: number;
  title: string;
  member_name: string;
  amount: number;
  amount_paid: number;
  status: 'Unpaid' | 'Paid' | 'Partial';
  payment_method?: string;
}

export interface DashboardSummary {
  total_books: number;
  total_copies: number;
  available_copies: number;
  total_members: number;
  borrowed_assets: number;
  fines_collected: number;
  fines_outstanding: number;
  category_distribution: { category_name: string; book_count: number }[];
  recent_transactions: Transaction[];
}
