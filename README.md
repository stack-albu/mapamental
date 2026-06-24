# MapaMental

Editor visual de mapas mentais com CRUD, canvas interativo e persistência preparada para Supabase.

## Rodar localmente

```bash
npm install
npm run dev
```

Sem variáveis de Supabase, o app usa `localStorage` automaticamente para você testar o produto.

## Supabase

1. Crie um projeto no Supabase.
2. Rode a migration `supabase/migrations/001_create_mind_maps.sql` no SQL Editor ou via Supabase CLI.
3. Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Com as variáveis presentes, o store muda automaticamente para Supabase. A tabela principal `mind_maps` já guarda o snapshot `nodes` e `edges` em `jsonb`, e as tabelas normalizadas ficam prontas para evolução colaborativa.

## Tabelas criadas

- `profiles`: perfil do usuário autenticado.
- `mind_maps`: CRUD principal dos mapas mentais.
- `mind_map_nodes`: nós normalizados do mapa.
- `mind_map_edges`: conexões normalizadas do mapa.
- `mind_map_tags`: tags reutilizáveis por usuário.
- `mind_map_shares`: compartilhamento futuro com viewer/editor.

## Funcionalidades atuais

- Criar, listar, editar, duplicar e excluir mapas.
- Editar título, descrição, tags e status.
- Criar, mover, conectar, editar e excluir nós.
- Persistência local pronta e estrutura Supabase-ready.