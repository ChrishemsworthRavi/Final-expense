export type SectionKey =
  | 'dashboard'
  | 'analytics'
  | 'expense-list'
  | 'bill-reminders'
  | 'subscriptions'
  | 'settings';


export type UserSession = {
  id: string;       
  email: string;    
}

export type Expense = {
  id: string;          
  title: string;       
  amount: number;      
  category: string;     
  date: string;         
  user_id: string;     
};
