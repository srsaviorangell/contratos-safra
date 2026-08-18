# CONTRATO-BASE-TEMPLATE — Modelo para o Motor de Geração de PDF

> Esta é a versão "para código" do `CONTRATO-BASE.docx`. Os placeholders aqui usam
> os mesmos nomes de campo do `DATABASE-SCHEMA.md`, para que o agente que for
> implementar a geração de PDF (ver `BACKEND-SPEC.md`) só precise mapear
> `contracts.<coluna>` → `{{placeholder}}`, sem reinventar o texto jurídico.

## Mapa de Placeholders → Colunas do Banco

| Placeholder                | Coluna em `contracts` (ou derivado)                         |
|-----------------------------|---------------------------------------------------------------|
| `{{contrato_id}}`           | `contracts.id`                                                 |
| `{{vendedor_nome}}`         | `profiles.full_name` (via `seller_id`)                         |
| `{{vendedor_documento}}`    | *(não existe hoje em `profiles` — ver nota abaixo)*             |
| `{{vendedor_endereco}}`     | *(não existe hoje em `profiles` — ver nota abaixo)*             |
| `{{vendedor_contato}}`      | `profiles.phone`                                                |
| `{{comprador_nome}}`        | `contracts.buyer_name`                                         |
| `{{comprador_documento}}`   | `contracts.buyer_document`                                      |
| `{{comprador_contato}}`     | `contracts.buyer_contact`                                       |
| `{{cultura}}`               | `crop_types.name` ou `contracts.crop_type_custom`               |
| `{{unidade_medida}}`        | `contracts.unit_type`                                           |
| `{{quantidade}}`            | `contracts.quantity`                                            |
| `{{observacoes_qualidade}}` | *(campo livre — ver nota abaixo)*                               |
| `{{valor_unitario}}`        | `contracts.unit_price` (formatado em BRL)                       |
| `{{valor_total}}`           | `contracts.total_value` (formatado em BRL)                      |
| `{{forma_pagamento}}`       | `contracts.payment_method`                                      |
| `{{prazo_pagamento}}`       | `contracts.payment_term`                                        |
| `{{data_entrega}}`          | `contracts.delivery_date`                                       |
| `{{local_entrega}}`         | *(campo livre — ver nota abaixo)*                               |
| `{{foro_comarca}}`          | `profiles.region` (ou configuração fixa da região piloto)       |
| `{{codigo_verificacao}}`    | `contracts.verification_hash`                                   |
| `{{data_geracao}}`          | `contracts.created_at`                                          |
| `{{data_confirmacao}}`      | `contracts.confirmed_at`                                        |

### ⚠️ Nota — campos que faltam no schema atual
Ao montar o `PRD.md`/`DATABASE-SCHEMA.md` original, três campos usados no contrato
jurídico completo **não foram previstos** na tabela `contracts`/`profiles`:

- `vendedor_documento` (CPF/CNPJ do produtor)
- `vendedor_endereco` (endereço/propriedade rural)
- `observacoes_qualidade` e `local_entrega` (campos livres de detalhamento)

Isso é uma lacuna real que apareceu só agora, ao redigir o texto jurídico completo.
**Recomendo adicionar essas colunas em `profiles` (documento, endereço) e em
`contracts` (observações de qualidade, local de entrega)** antes de implementar a
geração de PDF — sem isso, o contrato final sai incompleto (um contrato de compra e
venda sem CPF/endereço do vendedor tem validade jurídica mais frágil para identificar
as partes). Ajustar o `DATABASE-SCHEMA.md` é rápido; ajustar depois de já ter
contratos gerados é retrabalho.

---

## Texto Base do Contrato

> Formato de cláusulas corridas (estilo jurídico tradicional brasileiro), sem
> títulos/seções destacadas — cada cláusula é um parágrafo contínuo, com o nome
> da cláusula em negrito seguido do texto. Uma introdução breve (preâmbulo)
> qualifica as partes antes da primeira cláusula.

```
CONTRATO PARTICULAR DE COMPRA E VENDA DE SAFRA AGRÍCOLA
Contrato nº {{contrato_id}}

Pelo presente instrumento particular de compra e venda de safra agrícola, de
um lado {{vendedor_nome}}, portador(a) do CPF/CNPJ nº {{vendedor_documento}},
residente e domiciliado(a) em {{vendedor_endereco}}, telefone de contato
{{vendedor_contato}}, doravante denominado(a) simplesmente VENDEDOR(A), e de
outro lado {{comprador_nome}}, portador(a) do CPF/CNPJ nº
{{comprador_documento}}, telefone de contato {{comprador_contato}}, doravante
denominado(a) simplesmente COMPRADOR(A), têm entre si justo e acordado o
presente contrato, que se regerá pelas cláusulas seguintes:

CLÁUSULA PRIMEIRA – DO OBJETO. O presente contrato tem por objeto a compra e
venda da safra de {{cultura}}, na quantidade de {{quantidade}}, medida em
{{unidade_medida}}, observadas as seguintes condições de qualidade:
{{observacoes_qualidade}}.

CLÁUSULA SEGUNDA – DO PREÇO E DA FORMA DE PAGAMENTO. Pela mercadoria descrita
na Cláusula Primeira, o(a) COMPRADOR(A) pagará ao(à) VENDEDOR(A) o valor
unitário de {{valor_unitario}}, totalizando o valor de {{valor_total}},
calculado com base na quantidade e no valor unitário aqui acordados. O
pagamento será realizado da seguinte forma: {{forma_pagamento}}, com prazo de
{{prazo_pagamento}}.

CLÁUSULA TERCEIRA – DA ENTREGA. A entrega da mercadoria deverá ocorrer até
{{data_entrega}}, no seguinte local: {{local_entrega}}, salvo se as partes
acordarem, por escrito, data ou local distintos.

CLÁUSULA QUARTA – DA VALIDADE E DAS DISPOSIÇÕES GERAIS. O presente contrato é
celebrado em caráter particular, entre partes juridicamente capazes, e tem
validade a partir da assinatura de ambas, independentemente de registro em
cartório, nos termos da legislação civil aplicável à venda de bens móveis.
Eventuais divergências relacionadas à quantidade, qualidade ou condições de
pagamento deverão ser resolvidas amigavelmente entre as partes antes de
qualquer medida judicial. O não cumprimento das obrigações aqui previstas
sujeitará a parte inadimplente às penalidades previstas na legislação civil
vigente.

CLÁUSULA QUINTA – DO FORO. Fica eleito o foro da comarca de {{foro_comarca}}
para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia
expressa a qualquer outro, por mais privilegiado que seja.

CLÁUSULA SEXTA – DA VERIFICAÇÃO DE INTEGRIDADE DO DOCUMENTO. Este documento
foi gerado eletronicamente em {{data_geracao}} e confirmado digitalmente
pelo(a) COMPRADOR(A) em {{data_confirmacao}}, sob o código de verificação
{{codigo_verificacao}}, o qual comprova que o conteúdo aqui descrito
corresponde ao que foi confirmado por ambas as partes através da plataforma,
não substituindo, contudo, a assinatura ou o reconhecimento de firma.

E por estarem assim justos e contratados, as partes assinam o presente
instrumento em duas vias de igual teor e forma, na presença das testemunhas
abaixo, devendo a assinatura ser realizada fisicamente, com testemunhas, ou
digitalmente por meio de plataforma de assinatura eletrônica reconhecida
(ex.: gov.br), conforme escolha das partes, uma vez que este documento não
realiza a coleta de assinatura dentro do aplicativo.

_______________________________          _______________________________
Assinatura do(a) VENDEDOR(A)              Assinatura do(a) COMPRADOR(A)
{{vendedor_nome}}                          {{comprador_nome}}

Testemunha 1: _________________________________  CPF: _______________
Testemunha 2: _________________________________  CPF: _______________

Documento gerado eletronicamente pela plataforma Contrato de Safra. Este modelo é
uma base geral e não substitui orientação jurídica específica para casos que
exijam maior complexidade ou valores elevados.
```

## Aviso Importante
Este é um **modelo geral de referência**, pensado para o caso de uso descrito no
`PRD.md` (venda de safra entre produtor e comprador local, valores e volumes
típicos de pequeno/médio produtor). Não substitui análise de um advogado —
principalmente se, no futuro, o produto passar a lidar com valores altos,
adiantamento de recursos (o que puxaria o caso para o regime de CPR) ou cláusulas
mais específicas por tipo de cultura. Recomendo uma revisão jurídica pontual deste
texto antes de colocá-lo em produção com usuários reais, mesmo sendo um MVP.
