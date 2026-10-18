# Radar de Ideias — Quiz Missão & MBL

Questionário político independente criado por V. Guedes.

**Site de produção:** https://quiz-missao-mbl.vercel.app/

**Autor:** https://www.youtube.com/@vguedess · https://x.com/vguedessa

## Conteúdo

- **118 afirmações** aprovadas, embaralhadas por sessão.
- **105 programáticas** do Livro Amarelo e **13 culturais** relacionadas ao MBL.
- **Índice Missão:** pontua todas as 118 afirmações.
- **Índice MBL:** pontua somente as 13 afirmações culturais.
- **11 curvas personalizadas** e curvas padrão por direção.
- A referência de 100% usa exclusivamente a resposta **moderada** (“Concordo” ou “Discordo” alinhado) para cada questão respondida.
- “Não sei” é excluído de numerador e denominador; “Neutro” entra no denominador com pontuação zero.
- Índices não são limitados a 0–100%; valores superiores ou negativos são admitidos.
- Resultados por capítulos e faixas editoriais.
- Identificação por X, Instagram, nome ou anonimato.
- Consentimento opcional, desmarcado inicialmente.

A pergunta experimental 119 foi mantida em `archive/bonus-question-119.json` e não participa da pontuação.

## Armazenamento **nativo da Vercel**, sem PostgreSQL externo

Este site usa **Vercel Blob privado**, que tem franquia no plano Hobby. Nenhuma conta de Neon, Supabase ou banco SQL é necessária.

Cada resposta autorizada é gravada como um objeto JSON **privado e imutável**; a identidade é armazenada apenas dentro do arquivo privado. O nome do arquivo contém somente um identificador aleatório e os quatro números necessários para calcular médias (pontos e referências de Missão/MBL), nunca o @, nome ou texto das respostas. `/api/stats` calcula as médias pela listagem de metadados privados. O endpoint é cacheado por 15 minutos para economizar operações e evitar consultas desnecessárias. `/api/delete` permite a exclusão mediante posse do ID de tentativa aleatório salvo no navegador.

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
questions.js                       Afirmações e 11 curvas especiais
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
- Cartão editorial `#shareCard`: duas porcentagens grandes, Missão em amarelo e MBL em verde-menta, título da faixa, identificação opcional e endereço oficial. Os índices não são limitados em 100%.
- `share.js` gera PNG em 1080×1350 no próprio dispositivo. Em navegadores compatíveis, oferece compartilhamento nativo; nos demais, download direto. Nenhuma imagem individual é enviada ao servidor.
- Resultado MBL inclui **explicação própria**, independente do texto de Missão.
- `/results/mission-sigil.svg` e `/results/mbl-culture.svg` são ilustrações locais de fallback; as quatro fotografias originais **ainda não estão no repositório**. Quando forem disponibilizadas, copiar como `/results/amanda-oculos.png`, `/results/onca-poster.png`, `/results/renan-microfone.png` e `/results/onca-patch.png`. O código da pontuação não precisa ser modificado.

