# DutsNails V1 — Reserva sem login + Clube opcional

Projeto em Next.js preparado para Vercel + Supabase.

## Fluxo definido

- A cliente consegue reservar horário sem criar conta.
- O login/cadastro é opcional.
- O cadastro serve apenas para quem quiser participar do Clube Duts.
- O Clube Duts libera pontos, histórico, benefícios e lembrete de manutenção.

## Rotas

- `/` Site principal com reserva sem login
- `/clube` Cadastro/login visual do Clube Duts
- `/cliente` Área visual da cliente participante do Clube
- `/admin` Dashboard administrativo visual

## Como rodar localmente

1. Instale o Node.js.
2. Abra a pasta no VS Code.
3. Rode:

```bash
npm install
npm run dev
```

4. Acesse:

```bash
http://localhost:3000
```

## Como publicar na Vercel

1. Suba a pasta do projeto para um repositório no GitHub.
2. Na Vercel, clique em Add New Project.
3. Selecione o repositório.
4. Clique em Deploy.

## Conexão com Supabase

1. Crie um projeto no Supabase.
2. Vá em SQL Editor.
3. Cole o conteúdo de:

```bash
supabase/schema.sql
```

4. Execute.
5. Vá em Project Settings > API.
6. Copie:
   - Project URL
   - anon public key

7. Na Vercel, vá em:
   Project > Settings > Environment Variables

8. Cadastre:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
NEXT_PUBLIC_WHATSAPP_NUMBER=5511966818500
```

9. Faça Redeploy.

## Banco de dados

A tabela `appointments` aceita dois tipos de reserva:

### Reserva sem login

Usa:
- `guest_nome`
- `guest_telefone`
- `service_nome`
- `data`
- `horario`
- `quer_clube`

### Reserva com Clube Duts

Usa:
- `cliente_id`
- `service_id`
- `data`
- `horario`
- pontos vinculados na tabela `loyalty`

## Próxima etapa

Conectar o formulário ao Supabase para salvar a reserva automaticamente antes de abrir o WhatsApp.
