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

```
CONTRATO PARTICULAR DE COMPRA E VENDA DE SAFRA AGRÍCOLA
Nº do contrato: {{contrato_id}}

1. QUALIFICAÇÃO DAS PARTES

VENDEDOR(A)
Nome completo / Razão social: {{vendedor_nome}}
CPF/CNPJ: {{vendedor_documento}}
Endereço / Propriedade rural: {{vendedor_endereco}}
Telefone de contato: {{vendedor_contato}}

COMPRADOR(A)
Nome completo / Razão social: {{comprador_nome}}
CPF/CNPJ: {{comprador_documento}}
Telefone de contato: {{comprador_contato}}

2. OBJETO DO CONTRATO

O(A) VENDEDOR(A) compromete-se a vender, e o(a) COMPRADOR(A) a comprar, a produção
agrícola abaixo descrita, nas condições de quantidade, qualidade, preço, forma de
pagamento e prazo estabelecidas neste instrumento.

Cultura / Produto: {{cultura}}
Unidade de medida: {{unidade_medida}}
Quantidade: {{quantidade}}
Observações sobre a qualidade/classificação: {{observacoes_qualidade}}

3. PREÇO E CONDIÇÕES DE PAGAMENTO

Valor unitário: {{valor_unitario}}
Valor total do contrato: {{valor_total}}
Forma de pagamento: {{forma_pagamento}}
Prazo de pagamento: {{prazo_pagamento}}

O valor total foi calculado com base na quantidade e no valor unitário acordados
entre as partes, conforme descrito na Cláusula 2.

4. ENTREGA

Data prevista de entrega: {{data_entrega}}
Local de entrega: {{local_entrega}}

A entrega deverá ocorrer na data e local acima indicados, salvo acordo posterior
formalizado por escrito entre as partes.

5. DISPOSIÇÕES GERAIS

5.1. Este contrato é celebrado em caráter particular, entre partes juridicamente
capazes, e tem validade a partir da assinatura de ambas, independentemente de
registro em cartório, nos termos da legislação civil aplicável à venda de bens
móveis.

5.2. Eventuais divergências relacionadas à quantidade, qualidade ou condições de
pagamento devem ser resolvidas amigavelmente entre as partes antes de qualquer
medida judicial.

5.3. O não cumprimento das obrigações aqui previstas sujeita a parte inadimplente
às penalidades previstas na legislação civil vigente.

5.4. Fica eleito o foro da comarca de {{foro_comarca}} para dirimir quaisquer
dúvidas oriundas deste contrato.

6. VERIFICAÇÃO DE INTEGRIDADE DO DOCUMENTO

Código de verificação: {{codigo_verificacao}}
Gerado em: {{data_geracao}}
Confirmado pelo comprador em: {{data_confirmacao}}

Este código não substitui assinatura ou reconhecimento de firma. Ele apenas
comprova que o conteúdo deste documento corresponde ao que foi confirmado
digitalmente por ambas as partes através da plataforma.

7. ASSINATURAS

As partes declaram estar de acordo com todos os termos deste contrato. A
assinatura abaixo deve ser realizada fisicamente (com testemunhas) ou digitalmente
através de plataforma de assinatura eletrônica reconhecida (ex: gov.br), conforme
escolha das partes. Este documento não realiza a coleta de assinatura dentro do
aplicativo.

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
