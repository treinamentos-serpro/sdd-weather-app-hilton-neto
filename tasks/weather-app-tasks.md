# Backlog de Tarefas do Weather App

Backlog derivado de [weather-app-spec.md](../specs/weather-app-spec.md) e [weather-app-plan.md](../plans/weather-app-plan.md). As tarefas seguem a ordem de entrega e podem ser delegadas conforme suas dependências.

## Premissas para esta versão

- Manter os campos meteorológicos já usados pela aplicação até confirmação do produto.
- Considerar provisoriamente cinco dias diários incluindo hoje, como no serviço atual (`forecast_days=5`). Confirmar esta regra antes do aceite final.
- Manter Celsius como unidade interna; a escolha do usuário não persiste entre sessões nesta versão.
- Quando houver mais de uma cidade candidata, exigir seleção explícita; uma única correspondência pode ser selecionada automaticamente.
- Manter os resultados meteorológicos anteriores fora da tela durante uma nova busca, para evitar que pareçam pertencer à nova cidade.

As premissas acima não substituem as decisões pendentes da spec. Mudanças nelas podem alterar os critérios de aceite e os testes das tarefas afetadas.

## Entrega 1 — Contratos e funções de domínio

### T-01 — Alinhar tipos ao modelo de dados

- **Tipo:** ImplementaçãoSubstituir os dados mock por dados reais da Open-Meteo, isolando todo o acesso à rede em uma camada de services e conectando a UI por meio de um hook de estado
- **Descrição:** Atualizar os modelos compartilhados para representar cidade, clima atual, cinco dias de previsão e horário de obtenção. Campos meteorológicos que possam faltar devem aceitar `null`.
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay` e `WeatherData` representam o plano; campos ausentes não são codificados como zero; o projeto compila em TypeScript strict.
- **Dependências:** —
- **Requisitos:** RF-02, RF-03, RF-04, RF-05, RNF-05
- **Arquivos:** `src/types/weather.ts`

### T-02 — Completar funções puras de apresentação

- **Tipo:** Implementação e teste unitário
- **Descrição:** Garantir conversão de temperatura, formatação de datas/valores ausentes e mapeamento de códigos meteorológicos com fallback para códigos desconhecidos.
- **Critérios de aceite:** conversões incluem `0°C = 32°F`, `100°C = 212°F` e `-40°C = -40°F`; valor ausente é exibido como indisponível, não como zero; códigos não mapeados não quebram a UI; testes unitários cobrem os casos.
- **Dependências:** T-01
- **Requisitos:** RF-04, RF-05, RNF-03, RNF-04
- **Arquivos:** `src/lib/temperature.ts`, `src/lib/format.ts`, `src/lib/weatherCodes.ts`, `tests/unit/temperature.test.ts`, `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`

## Entrega 2 — Integração e validação de dados

### T-03 — Fortalecer busca de cidades no serviço

- **Tipo:** Implementação
- **Descrição:** Garantir que `searchCities` normalize espaços, ignore entrada vazia sem request e mapeie respostas de geocoding para `City[]`, incluindo os dados de desambiguação.
- **Critérios de aceite:** entrada vazia não chama `fetch`; query é codificada na URL; resposta válida com várias correspondências retorna todas as cidades até o limite configurado; ausência de resultados retorna lista vazia; falha HTTP, rede ou JSON inválido resulta em erro tipado.
- **Dependências:** T-01
- **Requisitos:** RF-01, RF-02, RF-06
- **Arquivos:** `src/services/weatherService.ts`

### T-04 — Validar e mapear a resposta de previsão

- **Tipo:** Implementação
- **Descrição:** Mapear clima atual e previsão da Open-Meteo para os tipos de domínio, preservando valores ausentes e validando as séries diárias.
- **Critérios de aceite:** URL usa coordenadas da cidade, timezone automático e cinco dias; a resposta válida produz cidade, clima atual e entradas diárias alinhadas por índice; ausência de dados permanece `null`; resposta estruturalmente inválida gera erro tipado; nenhuma temperatura é convertida no serviço.
- **Dependências:** T-01
- **Requisitos:** RF-03, RF-04, RF-05, RF-06, RNF-03, RNF-05
- **Arquivos:** `src/services/weatherService.ts`, `src/types/weather.ts`

### T-05 — Cobrir o serviço com testes de contrato

- **Tipo:** Teste unitário
- **Descrição:** Completar os testes de `weatherService` com respostas mockadas para geocoding e forecast.
- **Critérios de aceite:** testes cobrem query e parâmetros, cidade única e múltiplas cidades, resultado vazio, falha HTTP/rede, timeout, JSON inválido, resposta parcial e alinhamento dos dias; todos os cenários são determinísticos e não acessam a API real.
- **Dependências:** T-03, T-04
- **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-06
- **Arquivos:** `tests/unit/weatherService.test.ts`

## Entrega 3 — Orquestração e seleção

### T-06 — Implementar estados e ações do hook `useWeather`

- **Tipo:** Implementação
- **Descrição:** Orquestrar busca, seleção, consulta meteorológica e retry com estados distintos para busca, seleção ambígua, carregamento, vazio, sucesso e erro.
- **Critérios de aceite:** o hook expõe candidatos quando a busca retorna múltiplas cidades; seleciona automaticamente somente uma correspondência; `selectCity` consulta as coordenadas escolhidas; retry repete a última ação pertinente; uma resposta obsoleta não substitui a busca mais recente; dados de outra cidade não são apresentados durante uma nova consulta.
- **Dependências:** T-03, T-04
- **Requisitos:** RF-01, RF-02, RF-03, RF-06
- **Arquivos:** `src/hooks/useWeather.ts`

### T-07 — Testar transições do hook

- **Tipo:** Teste unitário
- **Descrição:** Criar testes focados nas transições e ações públicas de `useWeather`, mockando as funções do serviço.
- **Critérios de aceite:** cobertura de entrada vazia, carregamento, vazio, seleção de cidade, sucesso, falha, retry e resposta obsoleta; falhas não deixam o hook preso em carregamento.
- **Dependências:** T-06
- **Requisitos:** RF-01, RF-02, RF-03, RF-06
- **Arquivos:** `tests/unit/useWeather.test.ts`

### T-08 — Apresentar opções de cidades ambíguas

- **Tipo:** Implementação de UI
- **Descrição:** Criar uma lista acessível de cidades candidatas para o usuário escolher quando o geocoding retornar mais de uma correspondência.
- **Critérios de aceite:** cada opção mostra nome, região quando disponível e país; a opção selecionada é enviada ao hook; lista e ações são navegáveis por teclado e têm nomes acessíveis; a UI não escolhe silenciosamente a primeira opção.
- **Dependências:** T-01
- **Requisitos:** RF-02, RNF-02
- **Arquivos:** `src/components/CityResults.tsx`

## Entrega 4 — Interface e integração

### T-09 — Ajustar a busca para estados e acessibilidade

- **Tipo:** Implementação de UI
- **Descrição:** Conectar `SearchBar` à ação de busca, impedindo envio vazio e comunicando o estado de busca sem remover o acesso ao formulário.
- **Critérios de aceite:** campo tem label acessível; envio por botão e teclado funciona; valor vazio ou composto apenas por espaços não dispara busca; estado ocupado é perceptível e não permite envios conflitantes.
- **Dependências:** T-06
- **Requisitos:** RF-01, RF-06, RNF-02, RNF-04
- **Arquivos:** `src/components/SearchBar.tsx`

### T-10 — Completar componentes de estado

- **Tipo:** Implementação de UI
- **Descrição:** Garantir apresentação distinta para estado inicial/vazio, carregamento e erro, incluindo retry no erro.
- **Critérios de aceite:** mensagens correspondem ao estado; carregamento é anunciado de forma acessível; falha oferece ação de retry; estados não dependem exclusivamente de cor.
- **Dependências:** —
- **Requisitos:** RF-06, RNF-02, RNF-04
- **Arquivos:** `src/components/states/EmptyState.tsx`, `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`

### T-11 — Integrar seleção e consulta no `App`

- **Tipo:** Implementação de UI
- **Descrição:** Compor busca, resultados de cidade, estados da consulta, clima atual, previsão e alternador de unidade a partir do hook.
- **Critérios de aceite:** múltiplas cidades exigem seleção; busca sem resultados mostra estado vazio; falhas mostram retry; sucesso exibe cidade selecionada, clima atual e previsão; uma nova busca não deixa dados anteriores parecerem associados à cidade nova.
- **Dependências:** T-06, T-08, T-09, T-10
- **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-06
- **Arquivos:** `src/App.tsx`

### T-12 — Exibir clima atual e dados ausentes corretamente

- **Tipo:** Implementação de UI
- **Descrição:** Ajustar o componente de clima atual para os campos do domínio, identidade da cidade e valores nulos.
- **Critérios de aceite:** cidade e informações atuais ficam identificáveis; temperatura usa a unidade selecionada; campo nulo aparece como indisponível; não há valores fictícios para informações ausentes.
- **Dependências:** T-01, T-02, T-11
- **Requisitos:** RF-02, RF-03, RF-05, RF-06
- **Arquivos:** `src/components/CurrentWeather.tsx`

### T-13 — Exibir previsão de cinco dias

- **Tipo:** Implementação de UI
- **Descrição:** Ajustar lista e cartão diário para mostrar os dias disponíveis, temperaturas mínima/máxima e dados parciais sem afirmar cobertura inexistente.
- **Critérios de aceite:** a previsão apresenta cinco dias quando a API os fornece; datas usam o timezone retornado para a localização; valores nulos são identificados como indisponíveis; todas as temperaturas refletem a unidade selecionada.
- **Dependências:** T-01, T-02, T-11
- **Requisitos:** RF-04, RF-05, RF-06, RNF-03
- **Arquivos:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, `src/lib/format.ts`

### T-14 — Verificar alternância global de unidade

- **Tipo:** Implementação e teste de componente
- **Descrição:** Garantir que `UnitToggle` altera a unidade apresentada no clima atual e em todos os dias da previsão, sem novo request.
- **Critérios de aceite:** alternar C/F atualiza todas as temperaturas; rótulos correspondem aos valores; cidade e período permanecem visíveis; o serviço meteorológico não é chamado novamente pela troca; controles são acessíveis por teclado.
- **Dependências:** T-02, T-11, T-12, T-13
- **Requisitos:** RF-05, RNF-02, RNF-03
- **Arquivos:** `src/components/UnitToggle.tsx`, `src/App.tsx`, `tests/unit/UnitToggle.test.tsx`, `tests/unit/App.test.tsx`

## Entrega 5 — Testes integrados e hardening

### T-15 — Cobrir estados e componentes da aplicação

- **Tipo:** Teste de componente
- **Descrição:** Completar testes da UI para busca, seleção, loading, vazio, erro, retry, sucesso e valores ausentes.
- **Critérios de aceite:** Testing Library verifica os estados acessíveis e as ações do usuário; os testes cobrem seleção de cidade ambígua e mensagens de dados incompletos; nenhum teste depende de rede externa.
- **Dependências:** T-08, T-09, T-10, T-11, T-12, T-13
- **Requisitos:** RF-01, RF-02, RF-03, RF-04, RF-06, RNF-02, RNF-04
- **Arquivos:** `tests/unit/App.test.tsx`, `tests/unit/SearchBar.test.tsx`, testes de componentes existentes em `tests/unit/`

### T-16 — Validar fluxo E2E em desktop

- **Tipo:** Teste E2E
- **Descrição:** Cobrir o fluxo principal no Playwright usando respostas determinísticas interceptadas.
- **Critérios de aceite:** teste percorre busca, seleção quando ambígua, clima atual, previsão, alternância C/F, cidade inexistente e retry; verifica que dados não são atribuídos à cidade errada; não acessa serviços externos reais.
- **Dependências:** T-11, T-12, T-13, T-14
- **Requisitos:** RF-01 a RF-06
- **Arquivos:** `tests/e2e/weather.spec.ts`

### T-17 — Validar fluxo móvel e acessibilidade essencial

- **Tipo:** Teste E2E e hardening
- **Descrição:** Verificar o fluxo principal no projeto mobile já configurado e corrigir problemas de acesso por teclado, identificação de controles ou conteúdo estreito.
- **Critérios de aceite:** em viewport mobile, busca, escolha de cidade, clima atual, cinco dias e unidade podem ser usados sem conteúdo essencial inacessível; controles essenciais têm nome acessível e foco perceptível; fluxo principal funciona por teclado.
- **Dependências:** T-16
- **Requisitos:** RF-07, RNF-01, RNF-02, RNF-04
- **Arquivos:** `src/App.tsx`, componentes em `src/components/`, `tests/e2e/weather.spec.ts`

### T-18 — Executar gates de qualidade do projeto

- **Tipo:** Validação
- **Descrição:** Executar os comandos obrigatórios após concluir as implementações e corrigir regressões relacionadas às tarefas deste backlog.
- **Critérios de aceite:** `pnpm lint`, `pnpm build` e `pnpm test` passam; os testes E2E configurados passam em desktop e mobile; falhas preexistentes ou externas são registradas sem ampliar o escopo para correções não relacionadas.
- **Dependências:** T-05, T-07, T-15, T-16, T-17
- **Requisitos:** RNF-01 a RNF-06
- **Arquivos:** nenhum arquivo obrigatório; arquivos afetados pelas correções pertinentes

## Rastreabilidade

| Requisito | Tarefas |
| --- | --- |
| RF-01 — Buscar cidades | T-03, T-05, T-06, T-07, T-09, T-11, T-15, T-16 |
| RF-02 — Identificar a cidade | T-01, T-03, T-05, T-06, T-07, T-08, T-11, T-12, T-15, T-16 |
| RF-03 — Clima atual | T-01, T-04, T-05, T-06, T-07, T-11, T-12, T-15, T-16 |
| RF-04 — Previsão de cinco dias | T-01, T-02, T-04, T-05, T-11, T-13, T-15, T-16 |
| RF-05 — Celsius/Fahrenheit | T-01, T-02, T-04, T-12, T-13, T-14, T-16 |
| RF-06 — Estados da consulta | T-03, T-04, T-05, T-06, T-07, T-09, T-10, T-11, T-12, T-13, T-15, T-16 |
| RF-07 — Uso móvel | T-17 |
| RNF-01 — Responsividade | T-17, T-18 |
| RNF-02 — Acessibilidade | T-08, T-09, T-10, T-14, T-15, T-17 |
| RNF-03 — Consistência de unidade | T-02, T-04, T-12, T-13, T-14 |
| RNF-04 — Clareza de estado | T-02, T-09, T-10, T-15, T-17 |
| RNF-05 — Integridade e atualidade | T-01, T-04, T-06 |
| RNF-06 — Desempenho percebido | T-05, T-06, T-18 |