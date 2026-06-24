# 🗄️ Supabase + Deploy — Guia Completo

Este guia contém as instruções exatas e o SQL para configurar seu banco de dados Supabase e colocar sua aplicação no ar.

---

## PASSO 1 — Criar conta e projeto no Supabase

1. Abra **https://supabase.com** e clique em **"Start your project"**
2. Faça login com seu GitHub ou e-mail.
3. Clique em **"New Project"**.
4. Preencha os dados:
   - **Name:** `mapamental`
   - **Database Password:** crie uma senha forte e guarde-a.
   - **Region:** `South America (São Paulo)` — para melhor velocidade no Brasil.
5. Clique em **"Create new project"** e aguarde 1 a 2 minutos até que o projeto termine de ser provisionado.

---

## PASSO 2 — Criar a tabela e as regras de segurança

No painel do seu projeto Supabase recém-criado:

1. No menu esquerdo, clique em **"SQL Editor"** (ícone de código `</>`).
2. Clique em **"New query"** (botão verde no topo esquerdo).
3. **Copie e cole o SQL abaixo** no editor:

```sql
-- ============================================================
-- TABELA: mind_maps
-- Armazena todos os mapas mentais dos usuários
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mind_maps (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text         NOT NULL DEFAULT 'Sem título',
  description  text         NOT NULL DEFAULT '',
  status       text         NOT NULL DEFAULT 'active'
                            CHECK (status IN ('draft', 'active', 'archived')),
  is_favorite  boolean      NOT NULL DEFAULT false,
  tags         text[]       NOT NULL DEFAULT '{}',
  nodes        jsonb        NOT NULL DEFAULT '[]',
  edges        jsonb        NOT NULL DEFAULT '[]',
  viewport     jsonb        NULL,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

-- Índice: busca rápida por usuário
CREATE INDEX IF NOT EXISTS mind_maps_user_id_idx
  ON public.mind_maps(user_id);

-- Trigger: atualiza updated_at automaticamente em cada UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mind_maps_updated_at
  BEFORE UPDATE ON public.mind_maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEGURANÇA: Row Level Security (RLS)
-- Cada usuário só acessa os próprios mapas
-- ============================================================
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;

-- SELECT: só vê os próprios mapas
CREATE POLICY "users_select_own_maps"
  ON public.mind_maps FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: só cria mapas para si mesmo
CREATE POLICY "users_insert_own_maps"
  ON public.mind_maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: só edita os próprios mapas
CREATE POLICY "users_update_own_maps"
  ON public.mind_maps FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: só deleta os próprios mapas
CREATE POLICY "users_delete_own_maps"
  ON public.mind_maps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: user_preferences
-- Armazena preferências de cada usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id      uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme        text         NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  updated_at   timestamptz  NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- SELECT: só vê as próprias preferências
CREATE POLICY "users_select_own_prefs"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: só cria as próprias preferências
CREATE POLICY "users_insert_own_prefs"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: só altera as próprias preferências
CREATE POLICY "users_update_own_prefs"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

4. Clique no botão **"Run"** (no canto inferior direito ou topo direito).
5. O painel deve retornar que o comando foi executado com sucesso.

---

## PASSO 3 — Habilitar o Login (Sem necessidade de confirmação por e-mail para testes)

Para que você possa criar contas de teste rapidamente sem precisar abrir a caixa de entrada para ativar:

1. No menu esquerdo, vá em **"Authentication"** (ícone de cadeado/usuário).
2. Clique em **"Providers"** na barra superior/lateral do módulo.
3. Clique em **"Email"** para expandir as configurações.
4. **Desative** a opção **"Confirm email"** (isso fará com que o usuário seja logado na hora que se cadastrar).
5. Clique em **"Save"**.

---

## PASSO 4 — Copiar as chaves do projeto

1. Vá em **"Project Settings"** (ícone de engrenagem ⚙️ na barra lateral esquerda, lá embaixo).
2. Clique em **"API"**.
3. Copie os valores de:
   - **Project URL** (ex: `https://abcdkeyxyz.supabase.co`)
   - **anon / public** key (uma chave longa que começa com `eyJ...`)

---

## PASSO 5 — Configurar localmente no seu código

No seu editor de código, abra o arquivo **`.env.local`** que já criei para você na raiz do seu projeto (`mapamental/`) e cole as chaves que você copiou:

```env
NEXT_PUBLIC_SUPABASE_URL=COLE_SUA_PROJECT_URL_AQUI
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLE_SUA_ANON_PUBLIC_KEY_AQUI
```

Depois disso:
1. No seu terminal, pare o servidor atual (`Ctrl + C`).
2. Digite `npm run dev` para iniciá-lo de novo para carregar as novas variáveis.
3. Ao abrir `http://localhost:3000`, a tela de login aparecerá!

---

## PASSO 6 — Deploy na Vercel

1. Suba seu projeto para o seu repositório pessoal no **GitHub**.
2. Acesse **https://vercel.com** e faça login com a conta do seu GitHub.
3. Importe o repositório `mapamental`.
4. Em **"Environment Variables"**, adicione as mesmas duas chaves que você colocou no `.env.local`.
5. Clique em **"Deploy"**.
6. Uma vez feito o deploy, copie a URL gerada pela Vercel e vá no Supabase em **Authentication** → **URL Configuration** e coloque-a em **"Site URL"** e **"Redirect URLs"** para que a autenticação de redirecionamento funcione.
