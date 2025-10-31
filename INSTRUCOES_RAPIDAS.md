# 🚀 Instruções Rápidas - Finance App Completo

## ⚡ Setup Rápido (5 minutos) - VERSÃO ATUALIZADA

### 1. Banco de Dados MySQL
```sql
-- Execute no MySQL:
CREATE DATABASE finance_app;
USE finance_app;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabelas do Finance Dashboard integrado
CREATE TABLE balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO usuarios (email, senha_hash, perfil) VALUES 
('admin@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Dados de exemplo
INSERT INTO balances (user_id, amount) VALUES (1, 5234.56);
INSERT INTO expenses (user_id, description, amount, category, date) VALUES 
(1, 'Supermercado', 450.00, 'Alimentação', '2025-10-25'),
(1, 'Energia', 180.00, 'Utilidades', '2025-10-22');
INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date) VALUES 
(1, 'CDB Banco Inter', 'Renda Fixa', 5000.00, 5325.50, '2025-01-15');
```

### 2. Configurar .env.local
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=finance_app
DB_PORT=3306
JWT_SECRET=finance_app_super_secret_key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 3. Executar
```bash
npm install
npm run dev
```

## 🔑 Credenciais de Teste
- **Admin**: `admin@finance.com` / Senha: `password`
- **User**: `user@finance.com` / Senha: `password`

## 📍 URLs Principais
- **Login:** `http://localhost:3000`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Despesas:** `http://localhost:3000/expenses`
- **Investimentos:** `http://localhost:3000/investments`
- **Nova Despesa:** `http://localhost:3000/expenses/new`
- **Novo Investimento:** `http://localhost:3000/investments/new`
- **Editar Saldo:** `http://localhost:3000/balance/edit`

## ✅ Funcionalidades Implementadas
### Autenticação & Segurança
- ✅ Login/cadastro com email/senha
- ✅ JWT com expiração
- ✅ Hash de senhas (bcrypt)
- ✅ Proteção de rotas (middleware)
- ✅ Redirecionamento automático
- ✅ Logout funcional

### Finance Dashboard
- ✅ **Dashboard inteligente** com estatísticas
- ✅ **Gestão de saldo** (visualizar/editar)
- ✅ **Controle de despesas** (CRUD completo)
- ✅ **Gestão de investimentos** (CRUD completo)
- ✅ **Filtros avançados** por categoria/data
- ✅ **Cálculos automáticos** de rendimentos
- ✅ **Interface responsiva** e moderna

## 🎯 Próximos Passos
1. Execute o script SQL completo do `database_setup.sql`
2. Configure o .env.local
3. Execute `npm run dev`
4. Acesse http://localhost:3000
5. Faça login com as credenciais de teste
6. Explore o dashboard financeiro completo!

## 🔥 Funcionalidades Principais
1. **Dashboard** - Visão geral de suas finanças
2. **Despesas** - Adicione e gerencie seus gastos
3. **Investimentos** - Acompanhe sua carteira de investimentos
4. **Saldo** - Mantenha seu saldo atualizado
5. **Relatórios** - Estatísticas automáticas e insights

**Pronto! Seu sistema financeiro completo está funcionando! 🎉💰📊**
