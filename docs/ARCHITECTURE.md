# Arquitetura do MapaMental

## Stack

- Next.js App Router com TypeScript.
- Tailwind CSS v4 com design tokens em `src/app/globals.css`.
- React Flow para o canvas de mapa mental.
- Supabase/PostgreSQL para persistência real.
- `localStorage` como fallback para desenvolvimento sem variáveis de ambiente.

## Fluxo de dados

1. A interface chama `mindMapStore`.
2. Se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existirem, o store usa Supabase.
3. Sem essas variáveis, o store salva em `localStorage`.
4. O canvas trabalha com `nodes` e `edges` serializados em JSON, compatíveis com `jsonb`.

## Banco

A migration inicial está em `supabase/migrations/001_create_mind_maps.sql`.

Ela cria a tabela `mind_maps` com:

- CRUD protegido por RLS.
- Índices para usuário, atualização e tags.
- `nodes` e `edges` em `jsonb`.
- Trigger automática de `updated_at`.

## Próximas etapas recomendadas

- Adicionar autenticação Supabase.
- Criar service server-side para operações sensíveis.
- Adicionar busca por título/tags.
- Implementar histórico de versões por mapa.
