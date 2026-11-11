# Órbita | Proposta de gerenciamento de estacionamento

Versão 1.5.0 · Relatório de desenvolvimento mobile · 11 de novembro de 2026

## 2. Integrantes do grupo

Bruno Barroso dos Santos (RA 114091) e Ryan Augusto Dias (RA 113317).

## 3. Tema enviado ao professor

Aplicativo mobile para visualizar vagas disponíveis, registrar veículos, controlar entradas e saídas e consultar o uso das vagas. O grupo confirmou o envio desse tema ao professor Diego.

## 4. Problema e objetivo

Quando a placa fica em uma ficha e o vencimento da estadia em outra, o atendente precisa cruzar registros para responder quem ocupa a vaga e até que horas o carro pode ficar. Uma saída anotada em apenas uma das fichas pode deixar uma vaga livre marcada como ocupada.

O objetivo do Órbita é reunir veículo, vaga e período contratado em uma única estadia. Ao tocar em uma vaga ocupada, o operador vê a placa, o modelo, o horário de entrada, o tempo restante e as observações do cliente. Ao registrar a saída, libera a vaga e preserva a movimentação no histórico.

## 5. Justificativa e arquitetura

A operação de entrada e saída acontece no pátio. React Native com JavaScript e Expo SDK 58 permite usar as mesmas telas no celular e no navegador. O SQLite guarda os registros no dispositivo para que o operador possa fechar o aplicativo e retomar a consulta.

O banco relaciona quatro tabelas. Cada movimentação identifica a vaga e o veículo, registra o contrato inicial e recebe um horário de saída no encerramento. Cada prorrogação fica associada à movimentação que a originou. A gravação da entrada impede que o mesmo veículo ocupe duas vagas ao mesmo tempo.

## 6. Público-alvo

Atendentes e responsáveis por estacionamentos de pequeno e médio porte que controlam o pátio em um dispositivo. O atendente registra as movimentações durante o turno. O responsável consulta a ocupação e os horários registrados.

## 7. Fluxo de uso e operações disponíveis

1. No Início ou em Vagas, o operador escolhe uma das seis vagas do mapa. Em uma vaga livre, seleciona um veículo cadastrado ou informa placa e modelo. A placa deve seguir ABC1234 ou ABC1D23.
2. Na entrada, escolhe 1 hora por R$ 20, 5 horas por R$ 50 ou informa um período e um valor personalizados. Pode acrescentar até 500 caracteres de observações.
3. Na vaga ocupada, consulta o vencimento e o saldo proporcional ao tempo ainda disponível. Para prorrogar, registra o período adicional e o valor recebido. O tempo é somado ao vencimento atual. Se o prazo já passou, o novo período começa naquele momento.
4. Na saída, o aplicativo libera a vaga. O Histórico conserva os horários de entrada e saída, a identificação do veículo, o contrato e as prorrogações.

O cadastro oferece criação e consulta de veículos, com busca por placa ou modelo. As vagas são predefinidas e mudam de estado conforme as movimentações. A interface não oferece edição ou exclusão de cadastros. Os valores são informados pelo operador e o saldo proporcional representa o valor do tempo ainda disponível. O aplicativo não processa pagamentos.

## 8. Sensores e inteligência artificial

O operador informa os dados manualmente. A disponibilidade das vagas e o tempo restante são calculados a partir dos registros e do relógio do dispositivo. A versão 1.5 funciona sem sensores físicos, câmera ou inteligência artificial.

## 9. Repositório e validação

https://github.com/01ryu/gerenciamento-estacionamento

Na validação web da versão 1.5, uma estadia de 60 minutos por R$ 20 foi prorrogada para 120 minutos e R$ 40. Os totais permaneceram após recarregar a página e a saída liberou a vaga. Os testes de regras e migração do SQLite passaram, assim como as 20 verificações do Expo Doctor. Foram gerados pacotes JavaScript para Android, iOS e web. A execução em aparelho físico permanece pendente.

## 1. Evidências da atividade

O [relatório em PDF](Projeto_Estacionamento.pdf) apresenta telas do Órbita e, no anexo, as quatro capturas da execução web do Portal Acadêmico, Release 5.1, fornecido pelo professor com Expo SDK 57. Os registros de verificação estão em [testes do Órbita](TESTES_UI.md) e [execução do exemplo da disciplina](VERIFICACAO.md).

