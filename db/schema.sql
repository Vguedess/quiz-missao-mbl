-- Rodar uma vez no SQL Editor do Neon provisionado pelo Vercel Marketplace.
-- Os resultados são opiniões políticas pessoais: acesso restrito ao servidor.
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID UNIQUE NOT NULL,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('anonymous','x','instagram','name')),
  identity_value VARCHAR(60),
  consent BOOLEAN NOT NULL DEFAULT FALSE CHECK(consent = TRUE),
  answers JSONB NOT NULL,
  mission_points NUMERIC NOT NULL,
  mission_reference NUMERIC NOT NULL,
  mission_percent NUMERIC,
  mbl_points NUMERIC NOT NULL,
  mbl_reference NUMERIC NOT NULL,
  mbl_percent NUMERIC,
  mission_valid SMALLINT NOT NULL CHECK(mission_valid BETWEEN 0 AND 118),
  mbl_valid SMALLINT NOT NULL CHECK(mbl_valid BETWEEN 0 AND 13),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON quiz_results (created_at DESC);
-- Apenas funções backend acessam a tabela; não expor credenciais de leitura/escrita no navegador.
