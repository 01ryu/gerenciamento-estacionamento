# Órbita — Gerenciamento de Estacionamento

Protótipo acadêmico em React Native com Expo SDK 53 e banco de dados SQLite local. Versão 1.4.0 com identidade visual azul galáctica, logo original de carro e cancela e layout adaptado para celular e computador.

## Integração de vagas e veículos
- Clique em qualquer vaga no mapa inicial ou na tela Vagas para abrir seus detalhes.
- Vaga livre: selecione um veículo cadastrado ou use Novo veículo para cadastrar e selecionar sem perder a vaga.
- Vaga ocupada: veja placa, modelo e entrada e use Registrar saída desta vaga.
- Um veículo não pode ocupar duas vagas simultaneamente.
- A placa tem no máximo 7 caracteres; letras são convertidas para maiúsculas e caracteres especiais são removidos. O cadastro exige ABC1234 ou ABC1D23, tanto na interface como na camada de dados.
- O histórico mantém o veículo e os horários de entrada e saída separados.

## Tempo, valores e prorrogação
- Na entrada, escolha 1 hora por R$ 20, 5 horas por R$ 50 ou personalize minutos e valor. Registre até 500 caracteres de observações.
- Nos detalhes de uma vaga ocupada, use **Prorrogar estadia**, selecione o tempo adicional e o valor recebido e confirme.
- O período adicional começa no vencimento atual; se já venceu, começa no momento da prorrogação.
- Totais, novo prazo e cada prorrogação ficam salvos no SQLite e no histórico, preservando a entrada original.
- O saldo proporcional representa o tempo não utilizado de cada período; não indica dívida nem reembolso. Ao registrar saída, o saldo fica fixado naquele instante.
- Registros antigos sem contrato precisam ser encerrados e receber nova entrada para permitir prorrogação.

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
- `App.js`: estado e navegação.
- `database.js`: operações e migração do SQLite.
- `SpotDetails.js`: entrada/saída e cadastro integrado ao mapa.
- `ExtensionForm.js`: formulário de prorrogação.
- `parkingPlan.js` e `PlanSummary.js`: validação, cálculo e apresentação de períodos.
- `vehicleRules.js`: normalização e validação de placas.
- `Interface.js`: telas, componentes e tema.
- `Brand.js`: logo, ilustração e ícones vetoriais.
- `index.js`: inicialização do aplicativo.
- `app.json`, `package.json`, `metro.config.js`: configuração e dependências.

## Banco de dados
O app utiliza SQLite local por meio do pacote `expo-sqlite`. Na primeira execução, cria automaticamente `gerenciamento_estacionamento.db` e estas tabelas:
- `vagas`: código da vaga e estado Livre/Ocupada.
- `veiculos`: placa, modelo e data de cadastro.
- `movimentacoes`: vaga, placa, evento, horários, contrato inicial, observações e encerramento.
- `prorrogacoes`: períodos adicionais, valores recebidos e seus horários vinculados à movimentação.

Em uma instalação nova, as seis vagas começam livres e não há veículos fictícios. A atualização adiciona as novas colunas sem apagar cadastros ou movimentações existentes. Cadastros, atualizações de vagas e movimentações são gravados no dispositivo e permanecem após fechar/reabrir o app. O banco é local: não sincroniza com servidor e não compartilha dados entre aparelhos.

## Funcionalidades
- Consultar vagas livres e ocupadas.
- Cadastrar veículos, impedindo placas duplicadas.
- Registrar entrada e ocupar a vaga.
- Registrar saída e liberar a vaga.
- Consultar movimentações salvas.

## Limitações
Os valores são registros locais; não há processamento de pagamentos. O protótipo ainda não possui login, servidor remoto, sincronização ou sensores físicos.

Ocupações antigas sem placa são exibidas como “Veículo não informado” e podem ser encerradas pelo mapa. Datas que não existiam nos registros anteriores não são inventadas. Não há cobrança automática de tempo excedido nem sincronização entre dispositivos. No navegador, use uma única aba do aplicativo por endereço para evitar bloqueio do arquivo SQLite.

## Testes
Execute `node tests.cjs` com Node.js 22.13 ou superior para verificar validação, vínculos, transações e migração em um SQLite isolado em memória. A verificação manual de interface está em [TESTES_UI.md](TESTES_UI.md).

## Documentação da primeira entrega
- [Proposta inicial](PROPOSTA.md).
- [Relatório acadêmico em PDF](Projeto_Estacionamento.pdf).
- [Verificação do exemplo do professor](VERIFICACAO.md).

Esses documentos registram a etapa anterior ao protótipo SQLite. As capturas e os testes neles apresentados são do Portal Acadêmico do professor, não deste aplicativo. A atualização visual parte da versão 1.1.0 enviada pelo grupo. Os testes desta versão estão em [TESTES_UI.md](TESTES_UI.md). A execução nativa em Android/iOS ainda precisa ser validada.
