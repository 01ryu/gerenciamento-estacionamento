# Órbita — Gerenciamento de Estacionamento

Protótipo acadêmico em React Native com Expo SDK 53 e banco de dados SQLite local. Versão 1.2.0 com identidade visual azul galáctica, logo original de carro e cancela e layout adaptado para celular e computador.

## Interface
- Painel com vagas livres, ocupadas, veículos cadastrados e últimas movimentações.
- Mapa de vagas com rótulos de estado, cores e seleção visual.
- Logo vetorial original em `Brand.js` e arquivo reutilizável `logo.svg`.
- Busca por placa ou modelo na lista de veículos.
- Navegação fixa e botão **Voltar** no topo, com histórico das telas visitadas.
- Mensagens dentro da interface e bloqueio de cliques repetidos durante gravações.
- Áreas seguras para dispositivos móveis e estados de carregamento e lista vazia.

## Como executar
1. Clone este repositório ou baixe o ZIP e abra a pasta que contém `package.json`.
2. Instale Node.js LTS, se ainda não tiver.
3. No terminal, execute `npm install`.
4. Em seguida, execute `npx expo start`.
5. Escaneie o QR Code com o Expo Go compatível ou use um emulador Android.

Para testar no navegador, execute `npm run web`. O projeto inclui a configuração de WebAssembly e dos cabeçalhos COOP/COEP exigidos pelo SQLite web em `metro.config.js`. Em uma hospedagem web, esses cabeçalhos também precisam ser configurados no servidor. Não há site público publicado nesta entrega.

Também é possível instalar com `pnpm install --frozen-lockfile`; o arquivo `pnpm-lock.yaml` registra as versões utilizadas. Não misture os gerenciadores na mesma instalação.

## Arquivos principais
- `App.js`: estado, navegação e operações no SQLite.
- `Interface.js`: telas, componentes e tema.
- `Brand.js`: logo, ilustração e ícones vetoriais.
- `index.js`: inicialização do aplicativo.
- `app.json`, `package.json`, `metro.config.js`: configuração e dependências.

## Banco de dados
O app utiliza SQLite local por meio do pacote `expo-sqlite`. Na primeira execução, cria automaticamente `gerenciamento_estacionamento.db` e estas tabelas:
- `vagas`: código da vaga e estado Livre/Ocupada.
- `veiculos`: placa, modelo e data de cadastro.
- `movimentacoes`: vaga, evento, horário e estado de encerramento.

As vagas iniciais e um veículo de demonstração são inseridos apenas quando as tabelas correspondentes estão vazias. Cadastros, atualizações de vagas e movimentações são gravados no dispositivo e permanecem após fechar/reabrir o app. O banco é local: não sincroniza com servidor e não compartilha dados entre aparelhos.

## Funcionalidades
- Consultar vagas livres e ocupadas.
- Cadastrar veículos, impedindo placas duplicadas.
- Registrar entrada e ocupar a vaga.
- Registrar saída e liberar a vaga.
- Consultar movimentações salvas.

## Limitações
O valor de R$ 10,00 é demonstrativo, sem cobrança real. O protótipo ainda não possui login, servidor remoto, sincronização ou sensores físicos.

Nesta versão, o cadastro de veículos é separado das movimentações: a entrada é vinculada à vaga, sem associar a placa. O registro de saída substitui o evento e o horário da entrada; não calcula a duração da permanência. As vagas A02 e B01 começam ocupadas como demonstração, sem movimentação inicial para registrar sua saída.

## Documentação da primeira entrega
- [Proposta inicial](PROPOSTA.md).
- [Relatório acadêmico em PDF](Projeto_Estacionamento.pdf).
- [Verificação do exemplo do professor](VERIFICACAO.md).

Esses documentos registram a etapa anterior ao protótipo SQLite. As capturas e os testes neles apresentados são do Portal Acadêmico do professor, não deste aplicativo. A atualização visual parte da versão 1.1.0 enviada pelo grupo. Os testes desta versão estão em [TESTES_UI.md](TESTES_UI.md). A execução nativa em Android/iOS ainda precisa ser validada.
