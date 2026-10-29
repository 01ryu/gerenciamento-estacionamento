# Verificação da versão 1.2.0 — 29/10/2026

Ambiente: Expo SDK 53, React Native Web, SQLite real no navegador local, com WebAssembly e cabeçalhos COOP/COEP. Inspeção visual em 1280 × 720 e 390 × 844.

## Resultados verificados

- Inicialização e leitura das vagas e do veículo de demonstração.
- Cadastro de veículo e mensagem de sucesso na interface.
- Bloqueio de cadastro com a mesma placa.
- Persistência do veículo após recarregar e busca pela placa.
- Seleção de vaga, registro de entrada e atualização para ocupada.
- Persistência da movimentação após recarregar.
- Registro de saída e liberação da vaga.
- Botão Voltar: Histórico → Veículos → Início.
- Botão Voltar após entrada: Histórico → Vagas, com a vaga ainda ocupada.
- Navegação fixa, logo vetorial e composição responsiva em tamanho de celular e computador.

Os registros de teste ficaram apenas no armazenamento local do navegador; nenhum banco de dados de teste é incluído no repositório.

## Limites

Não foi gerado APK nem executado teste nativo em Android ou iOS. Foram preservadas as limitações funcionais do protótipo recebido: movimentações sem vínculo com placa, saída substituindo o horário da entrada e duas vagas de demonstração ocupadas sem movimentação inicial. Os testes antigos em VERIFICACAO.md continuam se referindo ao Portal Acadêmico do professor.
