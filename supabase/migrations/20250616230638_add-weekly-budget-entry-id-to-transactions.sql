ALTER TABLE transactions
ADD COLUMN weekly_budget_entry_id uuid;

ALTER TABLE transactions
ADD CONSTRAINT fk_weekly_budget_entry
FOREIGN KEY (weekly_budget_entry_id)
REFERENCES weekly_budget_entries(id)
ON DELETE SET NULL;