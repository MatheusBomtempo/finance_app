-- Comandos para criar a tabela investment_types
-- Execute este arquivo no seu cliente MySQL (phpMyAdmin, MySQL Workbench, etc.)

USE finance_app;

-- Criar tabela para tipos de investimentos
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

-- Inserir tipos de investimentos padrão
INSERT INTO investment_types (name, description, expected_return_percent, risk_level) VALUES 
('CDB', 'Certificado de Depósito Bancário', 12.50, 'Baixo'),
('Ações', 'Ações de empresas listadas na bolsa', 18.00, 'Alto'),
('Fundos de Investimento', 'Fundos diversificados gerenciados por especialistas', 14.00, 'Médio'),
('Tesouro Direto', 'Títulos do governo federal', 11.00, 'Baixo'),
('LCI', 'Letra de Crédito Imobiliário', 10.50, 'Baixo'),
('LCA', 'Letra de Crédito do Agronegócio', 10.80, 'Baixo'),
('Debêntures', 'Títulos de dívida corporativa', 15.00, 'Médio'),
('Fundos Imobiliários', 'Fundos de Investimento Imobiliário', 16.50, 'Alto');

-- Verificar se foi criado corretamente
SELECT * FROM investment_types;