# Gerenciamento de estacionamento

Projeto acadêmico de aplicativo mobile para visualizar vagas disponíveis, cadastrar veículos, registrar entradas e saídas e consultar o histórico de utilização das vagas.

## Situação atual

Este repositório contém a proposta e o relatório da atividade. O aplicativo de estacionamento ainda não foi implementado. As capturas incluídas no PDF são da execução web do **Portal Acadêmico - Release 5.1**, exemplo disponibilizado pelo professor, e não do futuro aplicativo de estacionamento.

## Documentação

- [Relatório da atividade em PDF](Projeto_Estacionamento.pdf): integrantes, tema, objetivo, justificativa, arquitetura proposta, público-alvo, fluxo, CRUD, sensores e evidências da execução do exemplo.
- [Proposta em texto](PROPOSTA.md): conteúdo da proposta para consulta pelo GitHub.
- [Verificação do exemplo](VERIFICACAO.md): ambiente e verificações realizadas.

## Escopo previsto

- Painel com vagas livres e ocupadas.
- Cadastro, consulta e atualização de veículos e vagas.
- Entrada vinculada a veículo e vaga disponível.
- Bloqueio de entrada duplicada e de ocupação de vaga indisponível.
- Registro de saída, duração da permanência e liberação da vaga.
- Histórico por placa e período.

## Arquitetura proposta

React Native, Expo e TypeScript, com persistência local em SQLite para um protótipo operado em um dispositivo. O uso por vários operadores dependerá de API, banco centralizado e controle transacional.

## Próximas etapas

1. Criar o projeto Expo do estacionamento.
2. Implementar o cadastro de vagas e veículos.
3. Implementar e testar entradas e saídas.
4. Adicionar persistência e histórico.
5. Validar o aplicativo em dispositivo Android.

O tema já foi enviado ao professor, conforme confirmação do grupo.
