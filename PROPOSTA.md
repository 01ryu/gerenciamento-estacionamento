# Proposta do projeto

Projeto acadêmico | Gerenciamento de estacionamento
1
DESENVOLVIMENTO MOBILE • PROPOSTA ACADÊMICA
Gerenciamento de estacionamento
Proposta do projeto final e evidências de execução do Portal Acadêmico - Release 5.1. As funcionalidades de estacionamento
descritas a seguir constituem o escopo proposto; as capturas ao final correspondem ao exemplo fornecido pelo professor.
2. Integrantes do grupo
Nome
RA
Bruno Barroso dos Santos
114091
Ryan Augusto Dias
113317
3. Tema do projeto
Aplicativo mobile para gerenciamento e controle de estacionamento, permitindo visualizar vagas
disponíveis, registrar veículos, controlar entradas e saídas e consultar informações sobre o uso das
vagas.
Envio ao professor Diego: o grupo confirmou que o tema já foi enviado.
4. Apresentação e problema a resolver
Objetivo: organizar a operação de um estacionamento por meio de um aplicativo que centralize o
cadastro de veículos e vagas, registre as movimentações e facilite a consulta da ocupação.
Contextualização: em estacionamentos que dependem de anotações manuais ou planilhas isoladas, a
atualização da disponibilidade pode ficar defasada. Isso dificulta localizar vagas livres, identificar os
veículos presentes e conferir horários de entrada e saída.
Lacuna identificada (GAP): ausência de um registro integrado entre veículo, vaga e permanência. A
proposta relaciona essas informações para reduzir inconsistências e permitir consultar a situação atual
e o histórico de utilização.
Resultado esperado: proporcionar ao operador uma visão clara das vagas livres e ocupadas, com
rastreabilidade das movimentações. A redução de erros e do tempo de atendimento deverá ser
avaliada nos testes do projeto.


Projeto acadêmico | Gerenciamento de estacionamento
2
Justificativa e arquitetura
5. Justificativa da aplicação
A aplicação se justifica pela necessidade de agilizar o atendimento e manter as informações do
estacionamento organizadas. Ao registrar a entrada vinculada a uma vaga e liberar essa vaga na saída,
o sistema evita que o controle de veículos fique separado do controle de ocupação.
O histórico permitirá consultar movimentações por placa e período, calcular a duração das
permanências e identificar padrões de utilização. O escopo inicial prioriza a operação do
estacionamento; cobrança, pagamentos e abertura automática de cancelas ficam fora da primeira
versão.
Escolha da arquitetura
Proposta: React Native com Expo e TypeScript, com foco inicial em Android. A escolha mantém a
continuidade com a tecnologia utilizada na disciplina e permite organizar telas, componentes e regras
de negócio em uma base comum.
Camada
Responsabilidade proposta
Interface
Telas de painel, vagas, veículos, movimentações e histórico; navegação entre as áreas.
Regras de negócio
Validar placa, disponibilidade da vaga, entrada ativa e encerramento da permanência.
Serviços e dados
Separar o acesso aos dados da interface. Para o protótipo em um aparelho, utilizar
persistência local com SQLite.
Evolução para vários
operadores
Utilizar API e banco centralizado, autenticação e operações transacionais para impedir a
ocupação simultânea da mesma vaga.
A versão inicial será concebida para um único dispositivo. A sincronização entre vários celulares depende da evolução para um
serviço centralizado. PWA não integra o escopo inicial.
6. Público-alvo
Operadores, responsáveis e gestores de estacionamentos de pequeno e médio porte, incluindo
estacionamentos privados e institucionais. Os operadores utilizarão as funções de cadastro, entrada e
saída; os gestores consultarão a ocupação e o histórico para acompanhar o uso das vagas.


Projeto acadêmico | Gerenciamento de estacionamento
3
Fluxo e funcionalidades
7. Fluxo iterativo de utilização
Etapa
Ação e resultado
1. Painel
Consultar totais de vagas livres e ocupadas e acessar as áreas do aplicativo.
2. Entrada
Localizar ou cadastrar o veículo pela placa e escolher uma vaga disponível.
3. Validação
Impedir entrada duplicada do veículo ou uso de vaga ocupada; apresentar mensagem para
correção.
4. Confirmação
Registrar data e hora da entrada e atualizar a vaga para ocupada.
5. Permanência
Consultar veículos presentes, vagas e tempo de permanência.
6. Saída
Selecionar a permanência ativa, registrar a saída, calcular a duração e liberar a vaga.
7. Consulta e repetição
Consultar o histórico e retornar ao painel para uma nova movimentação.
CRUD e inteligência artificial
Haverá CRUD de veículos e vagas: cadastrar, consultar, atualizar e excluir registros sem vínculos
impeditivos. Registros associados ao histórico deverão ser preservados ou desativados. As
movimentações terão abertura, consulta e encerramento, com restrições para manter a consistência do
histórico.
Não está previsto uso de inteligência artificial na primeira versão. Os dados serão registrados pelo
operador, e a ocupação será calculada a partir das entradas e saídas.
8. Sensores e recursos do dispositivo
O funcionamento básico não dependerá de sensores: o operador informará a placa e a vaga. Como
evolução opcional, a câmera poderá ler um QR Code de identificação da vaga. Não estão previstos
GPS, sensores físicos de presença ou reconhecimento automático de placas no escopo inicial.
9. Repositório GitHub
Perfil informado pelo grupo: https://github.com/01ryu.
Repositório do projeto: https://github.com/01ryu/gerenciamento-estacionamento.
Repositório público destinado à documentação, ao código-fonte e às próximas entregas do projeto. A
entrega atual reúne README, proposta, relatório PDF e registro da verificação do exemplo acadêmico.
O aplicativo de estacionamento ainda será desenvolvido.
