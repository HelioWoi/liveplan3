-- Função para adicionar entradas semanais padrão para um novo usuário
CREATE OR REPLACE FUNCTION public.initialize_weekly_budget()
RETURNS TRIGGER AS $$
DECLARE
    current_month TEXT;
    current_year INTEGER;
BEGIN
    -- Get current month and year
    SELECT TO_CHAR(NOW(), 'Month'), EXTRACT(YEAR FROM NOW()) INTO current_month, current_year;
    
    -- Insert default entries for Week 1
    INSERT INTO public.weekly_budget (user_id, week, month, year, category, description, amount)
    VALUES 
        (NEW.id, 'Week 1', current_month, current_year, 'Income', 'Weekly Income', 1250.00),
        (NEW.id, 'Week 1', current_month, current_year, 'Fixed', 'Rent', 300.00),
        (NEW.id, 'Week 1', current_month, current_year, 'Variable', 'Groceries', 100.00);

    -- Insert default entries for Week 2
    INSERT INTO public.weekly_budget (user_id, week, month, year, category, description, amount)
    VALUES 
        (NEW.id, 'Week 2', current_month, current_year, 'Income', 'Weekly Income', 1250.00),
        (NEW.id, 'Week 2', current_month, current_year, 'Fixed', 'Utilities', 150.00),
        (NEW.id, 'Week 2', current_month, current_year, 'Variable', 'Transportation', 50.00);

    -- Insert default entries for Week 3
    INSERT INTO public.weekly_budget (user_id, week, month, year, category, description, amount)
    VALUES 
        (NEW.id, 'Week 3', current_month, current_year, 'Income', 'Weekly Income', 1250.00),
        (NEW.id, 'Week 3', current_month, current_year, 'Fixed', 'Insurance', 200.00),
        (NEW.id, 'Week 3', current_month, current_year, 'Variable', 'Entertainment', 75.00);

    -- Insert default entries for Week 4
    INSERT INTO public.weekly_budget (user_id, week, month, year, category, description, amount)
    VALUES 
        (NEW.id, 'Week 4', current_month, current_year, 'Income', 'Weekly Income', 1250.00),
        (NEW.id, 'Week 4', current_month, current_year, 'Fixed', 'Phone & Internet', 100.00),
        (NEW.id, 'Week 4', current_month, current_year, 'Variable', 'Shopping', 150.00);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para inicializar o orçamento semanal quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_weekly_budget();
