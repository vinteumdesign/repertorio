# 21 Setlist — versão Supabase

## 1. Banco de dados
No Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/setup.sql` e execute.

## 2. Variáveis de ambiente
Na Vercel, adicione:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Use `.env.example` apenas como referência. Nunca publique chaves secretas ou `service_role`.

## 3. Login
Abra o app, crie uma conta com e-mail e senha e confirme o e-mail caso o Supabase solicite.
Na primeira entrada, as 47 músicas e o repertório serão importados automaticamente para sua conta.
