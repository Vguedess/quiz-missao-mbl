# Fotos dos resultados — arquivos presentes

As seis imagens foram carregadas no commit `Fotos para resultados` e estão associadas às faixas no arquivo `lib/bands.js`. **Todos os arquivos são JPEG (.jpg)**, e seus nomes originais foram preservados, inclusive espaços, acentos e maiúsculas. Os caminhos abaixo são os endereços efetivos no site (com caracteres especiais codificados na URL).

| Faixa | Arquivo real no repositório | URL usada no site |
|---|---|---|
| 25% a menos de 50% | `renan romântico.jpg` | `/results/imagens/renan%20rom%C3%A2ntico.jpg` |
| 50% a menos de 76% | `cute japa segurando livro amarelo.jpg` | `/results/imagens/cute%20japa%20segurando%20livro%20amarelo.jpg` |
| 76% a menos de 90% | `Amanda Vettorazo.jpg` | `/results/imagens/Amanda%20Vettorazo.jpg` |
| 90% até 100% | `Poster onça estilizada.jpg` | `/results/imagens/Poster%20on%C3%A7a%20estilizada.jpg` |
| Acima de 100% até 110% | `Renan com Microfone.jpg` | `/results/imagens/Renan%20com%20Microfone.jpg` |
| Acima de 110% | `onça fumando.jpg` | `/results/imagens/on%C3%A7a%20fumando.jpg` |

Faixas 0–9% e 10–24% continuam sem foto dedicada e usam a ilustração vetorial padrão.

O cartão exibido no site e o PNG exportado utilizam a mesma imagem escolhida pela faixa de Missão; o resultado MBL mantém sua arte cultural separada. O teste automatizado `tests/result-images.test.js` verifica o arquivo real, extensão, assinatura JPEG, URL exata e as faixas de resultado.

Não altere o texto do caminho `image` em `lib/bands.js` sem atualizar também o nome do arquivo ou o teste.
