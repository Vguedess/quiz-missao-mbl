# Radar de Ideias — Missão & MBL

Projeto independente de questionário de afinidade política.

**Site conectado ao GitHub:** https://quiz-missao-mbl-github.vercel.app/

**Criado por V. Guedes.** Canal: https://www.youtube.com/@vguedess · X: https://x.com/vguedessa.

O site evita informar antecipadamente o total de afirmações. Oferece espaço para apoio voluntário por Pix com botão de copiar chave. As quantidades abaixo são documentação interna para manutenção.

## Conteúdo

- **118 afirmações** apresentadas em ordem aleatória.
- **105 questões programáticas** com base nos capítulos do *Livro Amarelo*.
- **13 questões de cultura política** associadas ao universo MBL.
- Resultado **Missão**: considera as 118 afirmações.
- Resultado **MBL**: considera somente as 13 questões culturais.
- **11 escalas personalizadas**, além da pontuação padrão.

## Como se calcula a pontuação

Cada índice é `100 × pontos obtidos / pontos de referência`. O denominador usa a pontuação de **Concordo** ou **Discordo** conforme a direção considerada alinhada de cada afirmação, inclusive quando a escala é especial.

- Respostas **Não sei** não contam para o numerador nem para o denominador.
- Respostas **Neutro** valem zero e contam para o denominador.
- Resultados podem ultrapassar 100% ou ser negativos.
- As afirmações do MBL são contabilizadas nos dois resultados; as programáticas só no resultado Missão.

## Tecnologia

Site estático (HTML, CSS e JavaScript), responsivo e priorizado para acesso por celulares. Não requer cadastro ou servidor de banco de dados; o progresso é armazenado localmente pelo navegador.

Para desenvolver localmente:

```bash
python -m http.server 8080
```

Abra `http://localhost:8080`.

## Apoio voluntário

Chave Pix disponibilizada pelo criador: `vguedes.eth@mail3.me`. O apoio é opcional e não influencia a pontuação.

## Aviso

O quiz é um projeto independente, não oficial e não constitui instrumento psicométrico validado. Não representa endosso institucional do Partido Missão ou do MBL.
