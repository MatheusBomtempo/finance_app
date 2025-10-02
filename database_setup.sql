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

-- 5. Verificar se os dados foram inseridos corretamente
SELECT * FROM usuarios;

-- Nota: As senhas hashadas acima são para 'password' (senha padrão para testes)
-- Em produção, use senhas mais seguras e gere hashes apropriados
