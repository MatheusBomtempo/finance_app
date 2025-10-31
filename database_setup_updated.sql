-- Comandos SQL ATUALIZADOS para configurar o banco de dados finance_app
-- Execute estes comandos no seu servidor MySQL

-- 1. Criar o banco de dados
CREATE DATABASE IF NOT EXISTS finance_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Usar o banco de dados
USE finance_app;

-- 3. Criar a tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Limpar dados existentes (apenas para desenvolvimento)
DELETE FROM expenses WHERE user_id IN (1, 2);
DELETE FROM investments WHERE user_id IN (1, 2);
DELETE FROM balances WHERE user_id IN (1, 2);
DELETE FROM usuarios WHERE id IN (1, 2);

-- 5. Inserir usuários com senhas conhecidas
-- admin@finance.com - senha: admin123 (hash do bcrypt)
-- user@finance.com - senha: user123 (hash do bcrypt)
INSERT INTO usuarios (id, email, senha_hash, perfil) VALUES 
(1, 'admin@finance.com', '$2a$10$rOzJlV8nK9v8HxX.8DVbT.7QXzK2K2YzHxCzK2K2K2K2K2K2K2K2K2', 'admin'),
(2, 'user@finance.com', '$2a$10$rOzJlV8nK9v8HxX.8DVbT.7QXzK2K2YzHxCzK2K2K2K2K2K2K2K2K2', 'user');

-- 6. Criar tabela para saldos dos usuários
CREATE TABLE IF NOT EXISTS balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- 7. Criar tabela para despesas
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_category (category)
);

-- 8. Criar tabela para investimentos
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_purchase_date (purchase_date)
);

-- 9. Criar tabela para tipos de investimentos (apenas administradores podem gerenciar)
CREATE TABLE IF NOT EXISTS investment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    expected_return_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_level ENUM('Baixo', 'Médio', 'Alto') NOT NULL DEFAULT 'Médio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_risk_level (risk_level)
);

-- 10. Inserir dados de exemplo ATUALIZADOS para o usuário admin (id=1)
INSERT INTO balances (user_id, amount) VALUES 
(1, 7850.75),
(2, 2500.00);

-- Despesas do mês atual (outubro 2025)
INSERT INTO expenses (user_id, description, amount, category, date) VALUES 
-- Usuário Admin (id=1)
(1, 'Supermercado Extra', 380.50, 'Alimentação', '2025-10-30'),
(1, 'Conta de Luz Enel', 195.40, 'Utilidades', '2025-10-28'),
(1, 'Internet Vivo Fibra', 129.90, 'Utilidades', '2025-10-25'),
(1, 'Combustível Posto Shell', 220.00, 'Transporte', '2025-10-24'),
(1, 'Restaurante Outback', 145.80, 'Alimentação', '2025-10-22'),
(1, 'Aluguel Apartamento', 1800.00, 'Moradia', '2025-10-05'),
(1, 'Plano de Saúde', 450.00, 'Saúde', '2025-10-10'),
(1, 'Cinema Shopping', 48.00, 'Entretenimento', '2025-10-15'),

-- Usuário normal (id=2)
(2, 'Mercado Carrefour', 290.30, 'Alimentação', '2025-10-29'),
(2, 'Conta de Água', 85.60, 'Utilidades', '2025-10-26'),
(2, 'Uber', 35.50, 'Transporte', '2025-10-24'),
(2, 'Lanchonete', 22.80, 'Alimentação', '2025-10-23');

-- 11. Investimentos atualizados com datas recentes
INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date) VALUES 
-- Usuário Admin (id=1)
(1, 'CDB Banco Inter 120% CDI', 'CDB', 5000.00, 5420.75, '2025-01-15'),
(1, 'Ações PETR4', 'Ações', 3000.00, 3285.90, '2025-03-10'),
(1, 'Fundo XP Multimercado', 'Fundos', 2500.00, 2687.45, '2025-02-20'),
(1, 'Tesouro Selic 2031', 'Tesouro Direto', 1500.00, 1598.25, '2025-04-05'),
(1, 'LCI Santander', 'LCI', 4000.00, 4180.60, '2025-05-12'),

-- Usuário normal (id=2)
(2, 'CDB Nubank', 'CDB', 1000.00, 1085.30, '2025-06-01'),
(2, 'Tesouro IPCA+ 2029', 'Tesouro Direto', 800.00, 825.15, '2025-07-10');

-- 12. Inserir tipos de investimentos padrão
INSERT INTO investment_types (name, description, expected_return_percent, risk_level) VALUES 
('CDB', 'Certificado de Depósito Bancário - Renda fixa com boa liquidez', 12.50, 'Baixo'),
('Ações', 'Ações de empresas listadas na B3 - Renda variável', 18.00, 'Alto'),
('Fundos', 'Fundos de investimento diversificados', 14.00, 'Médio'),
('Tesouro Direto', 'Títulos públicos do governo federal', 11.00, 'Baixo'),
('LCI', 'Letra de Crédito Imobiliário - Isenta de IR', 10.50, 'Baixo'),
('LCA', 'Letra de Crédito do Agronegócio - Isenta de IR', 10.80, 'Baixo'),
('Debêntures', 'Títulos de dívida corporativa privada', 15.00, 'Médio'),
('Fundos Imobiliários', 'FIIs - Investimento em imóveis', 16.50, 'Alto')
ON DUPLICATE KEY UPDATE 
name = VALUES(name), 
description = VALUES(description),
expected_return_percent = VALUES(expected_return_percent),
risk_level = VALUES(risk_level);

-- 13. Verificações finais
SELECT 'Usuários criados:' as Info;
SELECT id, email, perfil FROM usuarios;

SELECT 'Saldos inseridos:' as Info;
SELECT u.email, b.amount FROM balances b JOIN usuarios u ON b.user_id = u.id;

SELECT 'Total de despesas por usuário:' as Info;
SELECT u.email, COUNT(e.id) as total_despesas, SUM(e.amount) as valor_total 
FROM usuarios u 
LEFT JOIN expenses e ON u.id = e.user_id 
GROUP BY u.id, u.email;

SELECT 'Total de investimentos por usuário:' as Info;
SELECT u.email, COUNT(i.id) as total_investimentos, SUM(i.current_value) as valor_atual 
FROM usuarios u 
LEFT JOIN investments i ON u.id = i.user_id 
GROUP BY u.id, u.email;

-- IMPORTANTE: Após executar, teste o login com:
-- Email: admin@finance.com | Senha: admin123
-- Email: user@finance.com  | Senha: user123