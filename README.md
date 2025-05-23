📘 README.md
markdown
Copiar
Editar
# Blog Backend

API REST para o sistema de blog, com autenticação, CRUD de artigos e recuperação de senha via e-mail.

---

## 🛠️ Tecnologias

- Node.js + Express
- TypeScript
- Prisma (MySQL)
- Multer (upload em memória)
- Sharp (redimensionamento de imagem)
- Bcrypt (hash de senha)
- JSON Web Tokens (autenticação)
- Nodemailer (envio de e-mail via SMTP)
- Mailtrap (sandbox de e-mail)

---

## 🚀 Instalação

1. **Clone o repositório**  
   ```bash
   git clone https://github.com/seu-usuario/blog-backend.git
   cd blog-backend
Instale as dependências

bash
Copiar
Editar
npm install
Crie o arquivo de variáveis de ambiente
Copie o modelo abaixo para um arquivo .env na raiz do projeto:

ini
Copiar
Editar
# Porta em que o servidor vai rodar
PORT=3333

# Conexão com MySQL
DATABASE_URL=mysql://<DB_USER>:<DB_PASS>@<DB_HOST>:<DB_PORT>/<DB_NAME>

# URL do frontend (para gerar links de reset de senha)
FRONTEND_URL=http://localhost:3000

# SMTP (Mailtrap Live)
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=api
SMTP_PASS=<SEU_API_TOKEN_MAILTRAP>
Crie o banco de dados

Caso ainda não tenha, crie um database MySQL com o nome que definiu em DATABASE_URL.

Gere o cliente Prisma e aplique migrations (se houver):

bash
Copiar
Editar
npx prisma generate
npx prisma migrate dev --name init
Importe o dump de dados (opcional)
Se você já tiver um dump.sql no repositório, importe assim:

bash
Copiar
Editar
mysql -u <DB_USER> -p <DB_NAME> < dump.sql
Popule dados de teste (seed)
Se tiver um script de seed (prisma/seed.ts), rode:

bash
Copiar
Editar
npm run seed
📦 Scripts úteis
npm run dev
Inicia o servidor em modo de desenvolvimento (com restart automático).

npm run build
Compila TypeScript.

npm start
Roda o build compilado.

npm run seed
Executa o seed para popular usuários e artigos de teste.

npx prisma studio
Abre o Prisma Studio (GUI para seu banco).

🧪 Testes manuais
Registrar usuário
POST /api/users/register

Login
POST /api/users/login → retorna JWT e dados do usuário.

Esqueci minha senha
POST /api/users/auth/forgot-password

Recebe { email }

Gera token, salva e dispara e-mail (visível no Mailtrap).

Resetar senha
POST /api/users/auth/reset-password

Recebe { token, newPassword }

CRUD de Artigos

GET /api/articles

GET /api/articles/:id

POST /api/articles (autenticado + multipart/form-data com campo thumbnail)

PUT /api/articles/:id (autenticado + multipart/form-data)

DELETE /api/articles/:id (autenticado)