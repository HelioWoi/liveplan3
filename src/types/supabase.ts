export type Goals = {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  user_id: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      goals: {
        Row: Goals;
        Insert: Omit<Goals, 'id' | 'created_at'>;
        Update: Partial<Goals>;
      };
    };
  };
};
