# Finance App

Aplicação de controle financeiro com autenticação JWT e MySQL.

## Funcionalidades

- ✅ Autenticação de usuários com JWT
- ✅ Proteção de rotas com middleware
- ✅ Hash de senhas com bcrypt
- ✅ Redirecionamento automático
- ✅ Interface moderna com Tailwind CSS
- ✅ Sistema de perfis (admin/user)

## Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## Instalação

### 1. Clone o repositório e instale as dependências

```bash
cd finance_app
npm install
```

### 2. Configure o banco de dados MySQL

Execute os comandos SQL do arquivo `database_setup.sql` no seu servidor MySQL:

```bash
mysql -u root -p < database_setup.sql
```

Ou execute manualmente no MySQL Workbench/phpMyAdmin:

```sql
-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS finance_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE finance_app;

-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir usuários de teste
INSERT INTO usuarios (email, senha_hash, perfil) VALUES 
('admin@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('user@finance.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e ajuste as configurações:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=finance_app
DB_PORT=3306
JWT_SECRET=sua_chave_secreta_super_segura
```

### 4. Execute a aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## Usuários de Teste

- **Admin**: `admin@finance.com` / Senha: `password`
- **User**: `user@finance.com` / Senha: `password`

## Estrutura do Projeto

```
finance_app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── autentica/     # API de login
│   │   │   └── logout/        # API de logout
│   │   ├── dashboard/         # Página protegida
│   │   ├── sem_permissao/     # Página de acesso negado
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx          # Página de login
│   ├── lib/
│   │   ├── auth.ts           # Funções de autenticação
│   │   └── database.ts       # Configuração MySQL
│   └── middleware.ts         # Middleware de proteção de rotas
├── database_setup.sql        # Scripts SQL
└── README.md
```

## Segurança

- Senhas são hashadas com bcrypt
- JWT com expiração configurável
- Cookies HTTP-only para tokens
- Middleware de proteção de rotas
- Validação de entrada em todas as APIs

## Rotas

- `/` - Página de login
- `/dashboard` - Dashboard protegido
- `/sem_permissao` - Página de acesso negado
- `/api/autentica` - API de autenticação (POST)
- `/api/logout` - API de logout (POST)

## Deploy

Para produção, certifique-se de:

1. Alterar `JWT_SECRET` para uma chave segura
2. Configurar `NODE_ENV=production`
3. Usar HTTPS
4. Configurar um servidor MySQL seguro
5. Implementar rate limiting
6. Configurar logs de auditoria

## Licença

Este projeto é para fins educacionais.
