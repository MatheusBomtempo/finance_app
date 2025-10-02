# 🚀 Instruções Rápidas - Finance App

## ⚡ Setup Rápido (5 minutos)

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

INSERT INTO usuarios (email, senha_hash, perfil) VALUES 
('admin@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
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

## 📍 URLs
- Login: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`
- Sem Permissão: `http://localhost:3000/sem_permissao`

## ✅ Funcionalidades Implementadas
- ✅ Login com email/senha
- ✅ JWT com expiração
- ✅ Hash de senhas (bcrypt)
- ✅ Proteção de rotas (middleware)
- ✅ Redirecionamento automático
- ✅ Logout funcional
- ✅ Página de acesso negado
- ✅ Interface moderna (Tailwind)

## 🎯 Próximos Passos
1. Execute os comandos SQL acima
2. Configure o .env.local
3. Execute `npm run dev`
4. Acesse http://localhost:3000
5. Faça login com as credenciais de teste

**Pronto! Sua aplicação está funcionando! 🎉**
