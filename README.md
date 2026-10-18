# Radar de Ideias — Missão & MBL

Projeto independente de questionário de afinidade política.

**Site conectado ao GitHub:** https://quiz-missao-mbl-github.vercel.app/

**Criado por V. Guedes.** Canal: https://www.youtube.com/@vguedess · X: https://x.com/vguedessa.

O site evita informar antecipadamente o total de afirmações. Oferece espaço para apoio voluntário por Pix com botão de copiar chave. As quantidades abaixo são documentação interna para manutenção.

## Conteúdo

- **119 afirmações** apresentadas em ordem aleatória.
- **105 questões programáticas** com base nos capítulos do *Livro Amarelo*.
- **14 questões de cultura política** associadas ao universo MBL, incluindo a pergunta especial “Prendeu, Matou?”.
- Resultado **Missão**: considera as 119 afirmações atualmente incluídas no questionário.
- Resultado **MBL**: considera somente as 14 questões culturais atualmente incluídas no questionário.
- **12 escalas personalizadas**, além da pontuação padrão. A questão cultural 119 utiliza `[5, 3, 1, 0, 0, 0, 0, 0]`, na ordem das oito respostas.

## Como se calcula a pontuação

Cada índice é `100 × pontos obtidos / pontos de referência`. O denominador usa a pontuação de **Concordo** ou **Discordo** conforme a direção considerada alinhada de cada afirmação, inclusive quando a escala é especial.

- Respostas **Não sei** não contam para o numerador nem para o denominador.
- Respostas **Neutro** valem zero e contam para o denominador.
- Resultados podem ultrapassar 100% ou ser negativos.
- As afirmações do MBL são contabilizadas nos dois resultados; as programáticas só no resultado Missão.

## Tecnologia

Site responsivo (HTML, CSS e JavaScript) com rotas opcionais de persistência em Vercel Functions. O progresso é armazenado localmente pelo navegador.

Para desenvolver localmente:

```bash
python -m http.server 8080
```

Abra `http://localhost:8080`.

## Apoio voluntário

Chave Pix disponibilizada pelo criador: `vguedes.eth@mail3.me`. O apoio é opcional e não influencia a pontuação.

## Aviso

O quiz é um projeto independente, não oficial e não constitui instrumento psicométrico validado. Não representa endosso institucional do Partido Missão ou do MBL.


## Participações e médias (novo)

- Tela de identificação opcional: X, Instagram, nome ou participação anônima.
- Consentimento explícito e desmarcado inicialmente para salvar respostas e resultados (opiniões políticas podem ser dados pessoais sensíveis).
- Faixas narrativas de resultado e médias agregadas, quando o banco estiver configurado.
- `api/submit.js` valida e recalcula toda pontuação no servidor; `api/stats.js` consulta médias no banco; `lib/scoring.js` centraliza pontuação.
- Migração SQL: `db/schema.sql`, testes: `npm test`.
- Sem consentimento ou sem banco configurado, o questionário é utilizável e armazena progresso apenas no dispositivo.

### Banco Vercel Marketplace

O produto legado Vercel Postgres foi descontinuado. A integração de banco indicada é **Neon Postgres via Vercel Marketplace**, com variável `DATABASE_URL` vinculada ao projeto Vercel. Depois de provisionar a conexão e executar `db/schema.sql` no editor SQL do banco, os endpoints passam a registrar participações e calcular as médias sem mudanças no código. Enquanto isso, o frontend informa corretamente que as estatísticas estão indisponíveis.

**Situação de acesso:** a conta Vercel devolveu HTTP 403 quando solicitada a provisionar integrações e armazenamento. Por isso, nenhum banco físico foi criado automaticamente e nenhuma média fictícia é exibida.
