# Firebase do Wings

O login, o perfil (dados e foto) e o histórico de atividade usam o Firebase, **no plano gratuito**: só Auth e Firestore. Sem ele configurado, o app roda em **modo de teste**: entra qualquer e-mail da equipe com qualquer senha, e tudo fica salvo só no navegador. A página de login avisa quando está nesse modo.

| Serviço   | Para quê                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------- |
| Auth      | Login com e-mail e senha, troca de senha                                                                                  |
| Firestore | `profiles/{email}`: dados do perfil e a foto (JPEG de 320 px dentro do documento); `profiles/{email}/activity`: histórico |

Só os e-mails de `src/data/team.ts` acessam. As regras de segurança estão em `firestore.rules`.

## Configurar (uma vez, uns 10 minutos)

1. **Projeto.** Em [console.firebase.google.com](https://console.firebase.google.com), crie um projeto (ou use um existente do Wings).
2. **Login.** Em _Authentication › Sign-in method_, ative **E-mail/senha**. Em _Authentication › Settings › User actions_, desmarque **Enable create (sign-up)**: só o script do passo 6 cria contas.
3. **Banco.** Em _Firestore Database_, crie o banco em modo de produção, na região `southamerica-east1` (São Paulo).
4. **Domínio.** Em _Authentication › Settings › Authorized domains_, adicione `wingsbr.app` (o `localhost` já vem).
5. **App web.** Em _Configurações do projeto › Seus apps_, adicione um app Web e copie os 4 valores para um arquivo `.env` na raiz:

   ```
   PUBLIC_FIREBASE_API_KEY=...
   PUBLIC_FIREBASE_AUTH_DOMAIN=...
   PUBLIC_FIREBASE_PROJECT_ID=...
   PUBLIC_FIREBASE_APP_ID=...
   ```

   Esses valores são públicos por natureza (vão para o navegador); quem protege os dados são as regras.

6. **Regras e contas.** No terminal, na raiz do projeto:

   ```bash
   npx firebase-tools login          # abre o navegador para entrar com a conta Google do projeto
   npx firebase-tools use --add      # escolha o projeto
   npm run firebase:regras           # publica firestore.rules
   ```

   Depois, em _Configurações do projeto › Contas de serviço_, gere uma chave privada (arquivo `.json`), guarde fora do repositório e rode:

   ```bash
   npm run firebase:contas -- caminho/da/chave.json
   ```

   O script cria a conta de cada pessoa da equipe que ainda não existe e mostra uma senha provisória **uma única vez**. Repasse cada senha por um canal privado e peça para a pessoa trocar no primeiro acesso (_Meu perfil › Trocar senha_). Rodar de novo não duplica nada.

7. **Build.** Com o `.env` preenchido, `npm run build` gera o site já apontando para o Firebase. Na Hostinger, as mesmas variáveis precisam estar no ambiente do build.

## Incluir ou remover alguém da equipe

1. Edite `src/data/team.ts`.
2. Atualize a lista de e-mails em `firestore.rules` e rode `npm run firebase:regras`.
3. Rode `npm run firebase:contas -- caminho/da/chave.json` para criar a conta nova. Para remover, desative a conta em _Authentication › Users_.

O script avisa se as regras estiverem com e-mails diferentes de `team.ts`.

## Troca de senha

"Esqueci minha senha" e "Trocar senha" mandam um link para o e-mail da conta. Os e-mails `@wingsbr.app` precisam existir como caixas de entrada para isso funcionar.

## Orçamento

O gerador de propostas (`public/ferramentas/orcamento/app/`) ainda salva as propostas no navegador de quem monta. Para a equipe ver as mesmas propostas e mandar o link para o cliente, ele precisa de um banco: o app já sabe usar o Supabase (`config.js` + `supabase/schema.sql` no projeto de origem), ou pode ser ligado a este mesmo Firestore.
