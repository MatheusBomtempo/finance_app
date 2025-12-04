# Finance App

Aplicação de controle financeiro com autenticação JWT e MySQL.

## Funcionalidades

- ✅ Autenticação de usuários com JWT
- ✅ Proteção de rotas com middleware
- ✅ Hash de senhas com bcrypt
- ✅ Redirecionamento automático
- ✅ Interface moderna com Tailwind CSS
- ✅ Sistema de perfis (admin/user)
- ✅ **Gestão de Saldos** - Visualizar e atualizar saldo pessoal
- ✅ **Controle de Despesas** - Adicionar, listar, filtrar e deletar despesas
- ✅ **Gestão de Investimentos** - Gerenciar portfólio de investimentos
- ✅ **Dashboard Inteligente** - Visão geral com estatísticas e gráficos
- ✅ **Relatórios Financeiros** - Análise de gastos e rendimentos
- ✅ **Sistema de Categorias** - Organização por categorias de despesas e tipos de investimentos

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

- **Admin**: `admin@finance.com` / Senha: `admin123`
- **User**: `user@finance.com` / Senha: `user123`

## Estrutura do Projeto

```
finance_app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── autentica/         # API de login
│   │   │   ├── cadastro/          # API de cadastro
│   │   │   ├── logout/            # API de logout
│   │   │   ├── balance/           # API de saldo
│   │   │   ├── expenses/          # API de despesas
│   │   │   └── investments/       # API de investimentos
│   │   ├── admin/                 # Área administrativa
│   │   ├── balance/edit/          # Editar saldo
│   │   ├── cadastro/              # Página de cadastro
│   │   ├── dashboard/             # Dashboard principal
│   │   ├── expenses/              # Gestão de despesas
│   │   │   └── new/               # Nova despesa
│   │   ├── investments/           # Gestão de investimentos
│   │   │   └── new/               # Novo investimento
│   │   ├── sem_permissao/         # Página de acesso negado
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx               # Página de login
│   ├── components/ui/             # Componentes de interface
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── lib/
│   │   ├── models/                # Modelos TypeScript
│   │   │   ├── Balance.ts
│   │   │   ├── Expense.ts
│   │   │   └── Investment.ts
│   │   ├── auth.ts                # Funções de autenticação
│   │   ├── database.ts            # Configuração MySQL
│   │   ├── sanitize.ts            # Funções de sanitização
│   │   └── session.ts             # Gestão de sessões
│   └── middleware.ts              # Middleware de proteção de rotas
├── database_setup.sql             # Scripts SQL completos
└── README.md
```

## Segurança

- Senhas são hashadas com bcrypt
- JWT com expiração configurável
- Cookies HTTP-only para tokens
- Middleware de proteção de rotas
- Validação de entrada em todas as APIs

## Rotas

### Páginas de Usuário
- `/` - Página de login
- `/cadastro` - Página de cadastro
- `/dashboard` - Dashboard principal com visão geral
- `/expenses` - Listagem de despesas
- `/expenses/new` - Adicionar nova despesa
- `/investments` - Listagem de investimentos
- `/investments/new` - Adicionar novo investimento
- `/balance/edit` - Atualizar saldo
- `/sem_permissao` - Página de acesso negado

### Páginas de Admin
- `/admin` - Área administrativa (apenas admins)

### APIs
- `/api/autentica` - API de autenticação (POST)
- `/api/logout` - API de logout (POST)
- `/api/cadastro` - API de cadastro (POST)
- `/api/balance` - API de saldo (GET, POST, PUT)
- `/api/expenses` - API de despesas (GET, POST, PUT, DELETE)
- `/api/investments` - API de investimentos (GET, POST, PUT, DELETE)

## Fluxo de Autenticação (Breve Descrição)

1) Login (index `/`)
- Usuário envia email/senha via formulário.
- `POST /api/autentica` valida credenciais no MySQL, gera JWT e seta cookie httpOnly `auth-token`.
- Em caso de sucesso, o cliente redireciona para `/dashboard`. Em falha, exibe modal com mensagem amigável.
- Após 5 tentativas falhas na mesma sessão/IP, a API bloqueia novas tentativas por 15 minutos.

2) Middleware (`src/middleware.ts`)
- Para páginas protegidas como `/dashboard`, verifica a presença/expiração do token (decodificação leve no Edge).
- Sem token válido: redireciona para `/` (com `?from=/dashboard`). Se já está logado e acessar `/`, redireciona para `/dashboard`.

3) Dashboard (`/dashboard`)
- Server Component usa `requireAuth()` que lê o cookie via `cookies()` (assíncrono) e valida o token.
- Se inválido/expirado: redireciona para `/`.
- Exibe “Bem-vindo, {email}” com sanitização (escape HTML) para segurança.

4) Logout
- `POST /api/logout` apaga o cookie `auth-token` e redireciona para `/`.

5) Cadastro (`/cadastro`)
- Formulário cria novo usuário via `POST /api/cadastro` (validações, bcrypt, email único).
- Após sucesso, redireciona para a tela de login.

## Deploy

Para produção, certifique-se de:

1. Alterar `JWT_SECRET` para uma chave segura
2. Configurar `NODE_ENV=production`
3. Usar HTTPS
4. Configurar um servidor MySQL seguro
5. Implementar rate limiting
6. Configurar logs de auditoria

## 🆕 Novos Recursos Integrados

### 📊 Dashboard Financeiro Completo
- Visão geral do saldo, despesas e investimentos
- Estatísticas em tempo real com cálculos automáticos
- Cards informativos com dados financeiros
- Links diretos para adicionar novos itens

### 💰 Gestão de Saldo
- Visualização do saldo atual
- Histórico de alterações
- Atualização manual do saldo
- Interface simples e intuitiva

### 📈 Controle de Despesas
- Listagem completa de todas as despesas
- Filtros por categoria, data e descrição
- Categorias predefinidas (Alimentação, Transporte, etc.)
- Cálculo automático de totais e médias
- Exclusão de despesas

### 🏦 Gestão de Investimentos
- Portfólio completo de investimentos
- Diferentes tipos (Renda Fixa, Ações, Fundos, etc.)
- Cálculo automático de rentabilidade
- Acompanhamento de performance individual
- Estatísticas de lucro/prejuízo

### 🎨 Interface Modernizada
- Design responsivo e atrativo
- Componentes reutilizáveis
- Feedback visual para todas as ações
- Navegação intuitiva
- Estados de carregamento e erro

### 🔒 Segurança Mantida
- Autenticação JWT preservada
- Proteção de rotas para todas as novas páginas
- Validação de dados no frontend e backend
- Sanitização de inputs
- Controle de acesso por usuário

## Licença

Este projeto é para fins educacionais.
