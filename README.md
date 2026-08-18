# contratos-safra

Plataforma de contratos de safra entre produtores rurais e compradores — versão **Web** (React + Vite) e **Mobile** (Expo / React Native).

## Funcionalidades

- Cadastro e login de vendedores
- Criação de contratos de safra em **7 passos** (mobile) ou formulário completo (web)
- Máscaras de CPF/CNPJ e telefone
- Confirmação do contrato pelo comprador com link de validação
- Confirmação direta pelo vendedor com alerta de reconhecimento de firma em cartório
- Cálculo automático de valor total
- Visualização e impressão do contrato
- Tema escuro no app mobile
- Dados armazenados localmente (web: localStorage · mobile: cache local)

## Stack

| Camada | Tecnologia |
|---|---|
| Web | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Mobile | Expo SDK 57, React Native, React Navigation, expo-print |
| Persistência | localStorage / AsyncStorage (backend futuro) |

## Como rodar

### Web

```bash
cd contrato-safra
npm install
npm run dev
```

Acesse http://localhost:5173

### Mobile

```bash
cd contrato-safra-mobile
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** ou pressione `w` para abrir no navegador.

## Screenshots

### Web

| Login | Cadastro |
|---|---|
| ![Login](screenshots/web-login.png) | ![Cadastro](screenshots/web-cadastro.png) |

| Home — lista de contratos | Novo contrato |
|---|---|
| ![Home](screenshots/web-home.png) | ![Novo contrato](screenshots/web-novo-contrato.png) |

| Novo contrato preenchido | Detalhe do contrato |
|---|---|
| ![Novo contrato preenchido](screenshots/web-novo-preenchido.png) | ![Detalhe](screenshots/web-detalhe.png) |

| Visualização do contrato |
|---|
| ![Preview](screenshots/web-preview.png) |

### Mobile

| Login | Cadastro |
|---|---|
| ![Login](screenshots/mob-login.png) | ![Cadastro](screenshots/mob-cadastro.png) |

| Home | Passo 1 — Vendedor | Passo 2 — Comprador |
|---|---|---|
| ![Home](screenshots/mob-home.png) | ![Vendedor](screenshots/mob-vendedor.png) | ![Comprador](screenshots/mob-comprador.png) |

| Passo 3 — Cultura | Escolha da cultura | Escolha da unidade |
|---|---|---|
| ![Cultura](screenshots/mob-cultura.png) | ![Modal cultura](screenshots/mob-cultura-modal.png) | ![Modal unidade](screenshots/mob-unidade-modal.png) |

| Passo 4 — Quantidade | Passo 5 — Valor | Passo 6 — Pagamento |
|---|---|---|
| ![Quantidade](screenshots/mob-qtd.png) | ![Valor](screenshots/mob-valor.png) | ![Pagamento](screenshots/mob-pagamento.png) |

| Calendário de entrega | Pagamento preenchido | Passo 7 — Revisão |
|---|---|---|
| ![Calendário](screenshots/mob-calendario.png) | ![Pagamento preenchido](screenshots/mob-pagamento-preenchido.png) | ![Revisão](screenshots/mob-revisao.png) |

| Home após criar | Detalhe do contrato | Visualização do contrato |
|---|---|---|
| ![Home pós contrato](screenshots/mob-home-pos.png) | ![Detalhe](screenshots/mob-detalhe.png) | ![Preview](screenshots/mob-preview.png) |