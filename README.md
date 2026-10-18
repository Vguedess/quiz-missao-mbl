# Radar de Ideias — Quiz Missão & MBL

Questionário político independente criado por V. Guedes.

**Site de produção:** https://quiz-missao-mbl.vercel.app/

**Autor:** https://www.youtube.com/@vguedess · https://x.com/vguedessa

## Conteúdo

- **123 afirmações** incluídas, embaralhadas por sessão.
- **105 programáticas** do Livro Amarelo e **18 culturais** relacionadas ao MBL.
- **Índice Missão:** pontua todas as 123 afirmações.
- **Índice MBL:** pontua somente as 18 afirmações culturais.
- **12 curvas personalizadas**, preservadas. A escala padrão é `[+3, +2, +1, 0, -1, -2, -3, 0]` (multiplicada pela direção da questão).
- A referência de 100% usa exclusivamente a resposta **moderada** (“Concordo” ou “Discordo” alinhado) para cada questão respondida.
- “Não sei” é excluído de numerador e denominador; “Neutro” entra no denominador com pontuação zero.
- Índices não são limitados a 0–100%; valores superiores ou negativos são admitidos.
- Resultados por capítulos e faixas editoriais.
- Identificação por X, Instagram, nome ou anonimato.
- Consentimento opcional, desmarcado inicialmente.

A afirmação cultural #119 **“Prendeu, Matou?”** foi integrada ao quiz. A escala exclusiva `[+5, +3, +1, 0, 0, 0, 0, 0]` aplica-se somente a ela; a referência moderada é +3. O arquivo `archive/bonus-question-119.json` mantém a origem histórica dessa regra. Os pesos de #9 a #16 do capítulo 2 não foram alterados.

A questão #120, **“O aborto deve ser permitido apenas em casos de estupro, risco de morte para a gestante ou anencefalia fetal.”**, pertence à **Cultura Política (MBL)**, alinhamento em **Concordo** e peso padrão `[+3, +2, +1, 0, -1, -2, -3, 0]` (a última opção é “Não sei”, excluída do cálculo). A referência é +2. Ela entra tanto no índice MBL quanto no índice Missão. A branch `release/v1.0` permanece preservada com o conjunto anterior de 119 questões.

A questão #121, **“Quem comete crime hediondo deve ser julgado e punido como adulto, independentemente se tem 10, 14 ou 20 anos de idade.”**, integra **Cultura Política (MBL)**, com resposta de referência **Concordo** (`dir:1`) e peso padrão `[+3, +2, +1, 0, -1, -2, -3, 0]`. A referência é +2 e a afirmação contribui para ambos os índices. Nenhuma curva especial existente foi alterada.

As questões **#122 — Pena de morte** e **#123 — Prisão perpétua** integram a **Cultura Política (MBL)**, ambas com resposta de referência **Concordo** (`dir:1`), escala padrão `[+3, +2, +1, 0, -1, -2, -3, 0]` e referência de +2 pontos por questão. Ambas entram nos índices Missão e MBL. São redações para pesquisa de opinião, não citações literais.

- **#122:** “A pena de morte deve ser permitida no Brasil para pessoas condenadas por crimes extremamente graves, como assassinato e estupro de crianças.”
- **#123:** “Pessoas condenadas por crimes extremamente graves, como estupro e feminicídio, devem poder receber prisão perpétua, sem direito à liberdade condicional.”

## Pergunta 0 e nova escala padrão

Após escolher a identificação e o consentimento, o participante vê uma tela introdutória denominada **Questão 0**, antes das 123 questões. Ela é apenas orientativa e não entra no total de questões, nem altera a ordem aleatória ou qualquer pontuação. É possível voltar a ela pela primeira afirmação.

Na escala padrão, **Concordo/Discordo** alinhado é a referência de 100% (+2 pontos), enquanto **Concordo totalmente/Discordo totalmente** alinhado vale **150%** por questão (+3 pontos). A combinação de metade das respostas extremas e metade moderadas seria 125% quando se considera apenas questões padrão alinhadas; questões com curvas especiais podem alterar o resultado. **Neutro** = 0, contabilizado no denominador. **Não sei** = excluído de numerador e denominador.

A inclusão das questões #122 e #123 cria a versão 3 do questionário. As novas participações são registradas em `quiz-participations/v3/`, e a média pública considera somente essa versão, sem misturar resultados de questionários com quantidades diferentes de questões. Registros anteriores de `v1` e `v2` permanecem preservados e disponíveis para exclusão pelo identificador original. Tentativas antigas recebem as novas questões ao final sem perder as respostas anteriores; participações já gravadas não são reenviadas automaticamente. A branch `release/v1.0` permanece preservada.

## Armazenamento **nativo da Vercel**, sem PostgreSQL externo

Este site usa **Vercel Blob privado**, que tem franquia no plano Hobby. Nenhuma conta de Neon, Supabase ou banco SQL é necessária.

Cada resposta autorizada é gravada como um objeto JSON **privado e imutável**; a identidade é armazenada apenas dentro do arquivo privado. O nome do arquivo contém somente um identificador aleatório e os quatro números necessários para calcular médias (pontos e referências de Missão/MBL), nunca o @, nome ou texto das respostas. `/api/stats` calcula as médias da versão atual pela listagem de metadados privados. O endpoint é cacheado por 15 minutos para economizar operações e evitar consultas desnecessárias. `/api/delete` permite a exclusão mediante posse do ID de tentativa aleatório salvo no navegador.

**Limitação:** Blob é armazenamento de objetos, não banco transacional. Essa arquitetura é adequada a um quiz inicial de pequeno volume; com muitos participantes, a listagem repetida e as cotas de operações poderão exigir outra arquitetura. As médias são estatísticas de participação voluntária, não uma amostra representativa da população.

### Conectar o Blob uma única vez

1. Acesse **Vercel > Beyond Curve > projeto `quiz-missao-mbl` > Storage**.
2. Escolha **Blob** (primeira opção nativa) e clique para criar novo armazenamento.
3. Selecione obrigatoriamente **Private**, não **Public**. Arquivos guardam respostas e podem revelar opinião política.
4. Conecte o armazenamento ao projeto e selecione **Production** e **Preview**.
5. Confirme a conexão. A Vercel adiciona `BLOB_STORE_ID` e autenticação automática OIDC (ou token legado de leitura e gravação) ao projeto.
6. Gere novo deploy (ou faça uma atualização no GitHub). **Não há SQL, migração ou token manual a colar.**

Enquanto o armazenamento não estiver conectado, o quiz funciona localmente e as APIs informam indisponibilidade; **não há simulação de médias ou gravação falsa**.

## Privacidade

As respostas políticas são potencialmente **dados pessoais sensíveis**. A gravação depende de consentimento separado e opcional. Sem autorização, o resultado continua no dispositivo e não entra na estatística agregada.

As participações não aparecem nominalmente. Quem autorizou e salvou pode solicitar **apagamento pelo próprio quiz**, no botão “Apagar meu registro”. Essa exclusão usa o identificador aleatório salvo no navegador. A indisponibilidade ou perda do dispositivo pode impedir o uso desse botão; antes do lançamento público deve existir um canal de contato para pedidos de exclusão e política de privacidade adequada à LGPD.

Não exponha credenciais, tokens ou o armazenamento em modo público. Evite guardar dados de identificação sem necessidade. Para maior escala, implemente proteção contra envios automatizados e manipulação estatística.

## Organização

```text
index.html / styles.css / app.js   Interface e fluxo do quiz
questions.js                       Afirmações e 12 curvas especiais
lib/scoring.js                     Pontuação validada
lib/bands.js                       Texto das 8 faixas
lib/blob-store.js                  Armazenamento privado e estatísticas
api/submit.js                      Registro autorizado
api/stats.js                       Médias agregadas
api/delete.js                      Remoção individual
tests/scoring.test.js              Testes de regressão
```

Para executar testes:

```bash
npm install
npm test
npm run check
```

O frontend sem API pode rodar em um servidor estático. As APIs dependem de Vercel Functions e do Blob privado conectado.

Projeto independente, sem endosso oficial do Partido Missão ou do MBL.


## Compartilhamento e personalização

- Título da aba: **Quiz Missão/MBL | Guedes**, com favicon SVG `G` em `/favicon.svg`.
- O clique no cabeçalho `VG` abre a página inicial **sem excluir o progresso**. O botão de retomada abre o questionário inacabado ou o resultado completo.
- Identificação social opcional na **home**, mesmo depois de responder: X / Instagram. O @ fica salvo no navegador e aparece no cartão pessoal ao retornar aos resultados. Alterar o @ localmente não modifica retroativamente um registro já armazenado no servidor.
- Cartão editorial `#affinityCard`: duas porcentagens grandes, Missão em amarelo e MBL em verde-menta, título da faixa, identificação opcional e endereço oficial. Os índices não são limitados em 100%.
- `share.js` gera PNG em 1080×1350 no próprio dispositivo. Em navegadores compatíveis, oferece compartilhamento nativo; nos demais, download direto. Nenhuma imagem individual é enviada ao servidor.
- Resultado MBL inclui **explicação própria**, independente do texto de Missão.
- As **seis imagens JPG já estão presentes** em `results/imagens/`, mantendo seus nomes originais. O mapeamento completo de faixas e URLs está em [`results/imagens/README.md`](results/imagens/README.md). O cartão de resultado e o arquivo PNG exportado usam as fotos por faixa, enquanto as artes vetoriais `/results/mission-sigil.svg` e `/results/mbl-culture.svg` permanecem como fallback. O teste `tests/result-images.test.js` valida nomes reais, assinaturas JPEG e pontuações.

