-- Comandos SQL para configurar o banco de dados finance_app
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

-- 4. Inserir um usuário admin de exemplo (senha: admin123)
-- A senha será hashada pela aplicação, mas você pode usar este comando para teste
INSERT INTO usuarios (email, senha_hash, perfil) VALUES 
('admin@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- 5. Criar tabela para saldos dos usuários
CREATE TABLE IF NOT EXISTS balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- 6. Criar tabela para despesas
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

-- 7. Criar tabela para investimentos
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

-- 8. Inserir dados de exemplo para o usuário admin (id=1)
INSERT INTO balances (user_id, amount) VALUES 
(1, 5234.56);

INSERT INTO expenses (user_id, description, amount, category, date) VALUES 
(1, 'Supermercado Pão de Açúcar', 450.00, 'Alimentação', '2025-10-25'),
(1, 'Conta de Energia', 180.00, 'Utilidades', '2025-10-22'),
(1, 'Internet Banda Larga', 120.00, 'Utilidades', '2025-10-20'),
(1, 'Combustível', 200.00, 'Transporte', '2025-10-18'),
(1, 'Restaurante', 85.00, 'Alimentação', '2025-10-15');

INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date) VALUES 
(1, 'CDB Banco Inter', 'Renda Fixa', 5000.00, 5325.50, '2025-01-15'),
(1, 'Ações PETR4', 'Ações', 3000.00, 3369.00, '2025-03-10'),
(1, 'Fundo Multimercado XP', 'Fundos', 2000.00, 2096.00, '2025-02-20'),
(1, 'Tesouro Selic', 'Renda Fixa', 1500.00, 1572.30, '2025-04-05');

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

-- 10. Inserir tipos de investimentos padrão
INSERT INTO investment_types (name, description, expected_return_percent, risk_level) VALUES 
('CDB', 'Certificado de Depósito Bancário', 12.50, 'Baixo'),
('Ações', 'Ações de empresas listadas na bolsa', 18.00, 'Alto'),
('Fundos de Investimento', 'Fundos diversificados gerenciados por especialistas', 14.00, 'Médio'),
('Tesouro Direto', 'Títulos do governo federal', 11.00, 'Baixo'),
('LCI', 'Letra de Crédito Imobiliário', 10.50, 'Baixo'),
('LCA', 'Letra de Crédito do Agronegócio', 10.80, 'Baixo'),
('Debêntures', 'Títulos de dívida corporativa', 15.00, 'Médio'),
('Fundos Imobiliários', 'Fundos de Investimento Imobiliário', 16.50, 'Alto');

-- 11. Verificar se os dados foram inseridos corretamente
SELECT * FROM usuarios;
SELECT * FROM balances;
SELECT * FROM expenses LIMIT 5;
SELECT * FROM investments LIMIT 5;
SELECT * FROM investment_types;

-- Nota: As senhas hashadas acima são para 'password' (senha padrão para testes)
-- Em produção, use senhas mais seguras e gere hashes apropriados
