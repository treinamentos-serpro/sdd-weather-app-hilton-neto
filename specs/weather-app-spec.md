# Especificação do Weather App

## Overview

Aplicação de previsão do tempo para pessoas que precisam consultar as condições meteorológicas de uma cidade e planejar os próximos dias. O produto permite buscar cidades, visualizar o clima atual e a previsão de cinco dias, alternar entre Celsius e Fahrenheit e realizar essas tarefas em dispositivos móveis.

O objetivo desta versão é oferecer uma consulta clara e utilizável, informando a cidade a que os dados se referem e comunicando carregamentos, ausência de resultados e falhas. Provedor de dados, campos meteorológicos exatos e algumas regras de consulta ainda precisam de decisão.

## Functional Requirements

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise cidades pelo nome.
- **RF-02 — Identificar a cidade consultada:** apresentar informação suficiente para que o usuário reconheça a cidade associada aos dados meteorológicos. Quando a busca retornar localidades ambíguas, o produto deve evitar associar dados à cidade errada; a forma de seleção precisa ser definida.
- **RF-03 — Consultar clima atual:** para uma cidade identificada, apresentar informações meteorológicas atuais dessa cidade.
- **RF-04 — Consultar previsão de cinco dias:** para a mesma cidade, apresentar a previsão referente a cinco dias consecutivos. A inclusão do dia atual e a granularidade dos dados precisam ser definidas.
- **RF-05 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit e refletir a unidade escolhida em todas as temperaturas apresentadas.
- **RF-06 — Comunicar estados da consulta:** informar quando uma busca está em andamento, não retorna resultados ou falha. Não apresentar dados indisponíveis como se fossem atuais.
- **RF-07 — Usar em dispositivos móveis:** manter busca, consulta do clima, consulta da previsão e alternância de unidade acessíveis em telas móveis.

## User Stories

- **US-01:** Como pessoa que consulta o tempo no dia a dia, quero buscar uma cidade para conhecer as condições meteorológicas do local de meu interesse.
- **US-02:** Como pessoa que precisa decidir o que fazer agora, quero ver o clima atual para me preparar para as condições do momento.
- **US-03:** Como pessoa que planeja os próximos dias, quero consultar a previsão de cinco dias para organizar meus compromissos.
- **US-04:** Como pessoa habituada a uma unidade específica, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas com facilidade.
- **US-05:** Como pessoa que consulta o tempo pelo celular, quero acessar as mesmas informações e ações em uma tela móvel para usar o serviço em diferentes contextos.
- **US-06:** Como pessoa diante de uma busca sem resultado ou de uma falha, quero receber uma indicação clara do que ocorreu para entender por que os dados não estão disponíveis.

## Acceptance Criteria

### RF-01 — Buscar cidades

- **Dado** que o usuário informe o nome de uma cidade, **quando** iniciar a busca, **então** o sistema deve consultar correspondências para esse nome.
- **Dado** que o campo de busca esteja vazio ou contenha apenas espaços, **quando** o usuário tentar buscar, **então** nenhuma consulta deve ser iniciada.

### RF-02 — Identificar a cidade consultada

- **Dado** que uma busca retorne uma cidade, **quando** o sistema apresentar dados meteorológicos, **então** deve identificar a cidade associada a esses dados.
- **Dado** que a busca retorne mais de uma localidade que possa corresponder ao nome informado, **quando** o usuário for consultar os dados, **então** o sistema não deve atribuir silenciosamente os dados a uma localidade não confirmada.

### RF-03 — Consultar clima atual

- **Dado** que uma cidade esteja identificada e os dados estejam disponíveis, **quando** a consulta for concluída, **então** o sistema deve apresentar as condições atuais associadas a essa cidade.
- **Dado** que os dados atuais não estejam disponíveis, **quando** a consulta for concluída, **então** o sistema deve comunicar a indisponibilidade e não rotular dados antigos ou incompletos como atuais.

### RF-04 — Consultar previsão de cinco dias

- **Dado** que uma cidade esteja identificada e a previsão esteja disponível, **quando** a consulta for concluída, **então** o sistema deve apresentar dados para cinco dias consecutivos, conforme a definição de período a ser confirmada.
- **Dado** que a previsão esteja incompleta, **quando** os resultados forem apresentados, **então** o sistema deve indicar os dias sem dados sem inventar valores ou sugerir cobertura completa.

### RF-05 — Alternar unidade de temperatura

- **Dado** que temperaturas estejam visíveis em Celsius, **quando** o usuário selecionar Fahrenheit, **então** todas as temperaturas visíveis devem passar a representar a mesma condição na unidade Fahrenheit e indicar essa unidade.
- **Dado** que temperaturas estejam visíveis em Fahrenheit, **quando** o usuário selecionar Celsius, **então** todas as temperaturas visíveis devem passar a representar a mesma condição na unidade Celsius e indicar essa unidade.
- **Dado** que o usuário altere a unidade, **quando** os valores forem atualizados, **então** a cidade e o período meteorológico consultados devem permanecer identificáveis.

### RF-06 — Comunicar estados da consulta

- **Dado** que uma busca esteja em andamento, **quando** o sistema aguardar os resultados, **então** deve indicar que a consulta está carregando.
- **Dado** que uma busca não encontre correspondências, **quando** ela terminar, **então** o sistema deve informar que não há resultados e não deve mostrar dados de outra cidade como correspondência.
- **Dado** que ocorra uma falha ao buscar cidade, clima atual ou previsão, **quando** o sistema não puder concluir a consulta, **então** deve informar a falha sem apresentar os dados afetados como atuais.

### RF-07 — Usar em dispositivos móveis

- **Dado** que o usuário acesse o produto em uma tela móvel, **quando** buscar uma cidade e consultar os resultados, **então** deve conseguir identificar e usar a busca, acessar o clima atual e a previsão e alternar a unidade sem que controles ou informações essenciais fiquem inacessíveis.

## Non-Functional Requirements

- **RNF-01 — Responsividade:** os fluxos de busca, consulta e alternância de unidade devem permanecer utilizáveis em dispositivos móveis e em telas maiores, sem perda de conteúdo ou controles essenciais.
- **RNF-02 — Acessibilidade:** campos e ações devem ter nomes compreensíveis; informações meteorológicas devem ter estrutura clara; os fluxos essenciais devem ser operáveis por teclado. O foco dos controles deve ser perceptível.
- **RNF-03 — Consistência:** toda temperatura exibida deve corresponder à unidade selecionada, incluindo clima atual e previsão.
- **RNF-04 — Clareza de estado:** carregamento, ausência de resultados e falha devem ser distinguíveis entre si e compreensíveis sem depender exclusivamente de cor.
- **RNF-05 — Integridade e atualidade:** cada resultado deve estar associado à cidade consultada; informações indisponíveis ou desatualizadas não devem ser apresentadas como atuais. A tolerância de atualização ainda precisa ser definida.
- **RNF-06 — Desempenho percebido:** durante consultas demoradas, o sistema deve manter o estado de carregamento perceptível e não deixar o usuário sem indicação de progresso. Metas numéricas de resposta estão em aberto.

## Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Campo vazio ou contendo apenas espaços | Não iniciar a consulta e manter a interface em estado utilizável. |
| Cidade inexistente | Informar que nenhuma cidade correspondente foi encontrada; não exibir dados de outra localidade. |
| Nome de cidade compartilhado por várias localidades | Não associar silenciosamente os dados a uma localidade; permitir identificação da cidade correta conforme a regra de desambiguação a definir. |
| Nome com acentos, pontuação ou outros caracteres especiais | Processar a busca sem quebrar a interface; apresentar resultados correspondentes quando disponíveis ou informar ausência de resultados. A regra exata de normalização está em aberto. |
| Falha de rede ou indisponibilidade do serviço de dados | Informar que a consulta falhou e não apresentar os dados afetados como atuais. |
| Consulta sem resposta ou excessivamente demorada | Manter uma indicação de carregamento enquanto aguarda; ao atingir o limite de espera a definir, informar a falha sem travar a interface. |
| Resposta sem clima atual | Informar que o clima atual não está disponível, sem inventar valores. |
| Previsão parcial, com um ou mais dias sem dados | Identificar a indisponibilidade dos dias afetados e não sugerir que os cinco dias estão completos. |
| Alternância de unidade durante uma consulta | Aplicar a unidade escolhida aos valores que forem apresentados, sem misturar Celsius e Fahrenheit. |
| Nome de cidade longo ou tela estreita | Manter legíveis a identificação da cidade, os dados essenciais e os controles de busca e unidade. |

## Assumptions

- A busca é feita pelo nome da cidade; busca por país, estado, código postal ou localização atual não foi solicitada.
- O clima atual e a previsão exibidos após uma busca pertencem à mesma cidade identificada.
- A previsão deve cobrir cinco dias consecutivos, embora a data inicial e a granularidade ainda precisem ser confirmadas.
- O usuário precisa de conexão para obter dados meteorológicos; o produto deve comunicar quando não conseguir obtê-los.
- Não foram informados requisitos de login ou de armazenamento persistente de preferências.

## Risks

- **Cidades homônimas ou ambíguas:** o usuário pode consultar a localidade errada. **Mitigação:** definir critérios de desambiguação e identificar claramente a cidade associada aos resultados.
- **Indisponibilidade, lentidão ou limite do serviço de dados:** consultas podem falhar ou demorar. **Mitigação:** estados de carregamento e falha claros e definição de política de timeout e nova tentativa.
- **Interpretação divergente de “cinco dias”:** diferentes períodos podem satisfazer a descrição de maneiras incompatíveis. **Mitigação:** decidir se o período inclui hoje e qual granularidade mostrar antes do planejamento técnico.
- **Campos meteorológicos incompletos ou inconsistentes:** alguns dados podem faltar ou parecer atuais sem serem. **Mitigação:** definir campos obrigatórios e apresentar explicitamente dados ausentes ou desatualizados.
- **Temperaturas inconsistentes após alternância:** valores ou rótulos podem não acompanhar a unidade selecionada. **Mitigação:** exigir consistência de unidade em todos os dados de temperatura visíveis.
- **Conteúdo ou controles inacessíveis em telas pequenas:** o usuário pode não conseguir completar o fluxo no celular. **Mitigação:** validar os fluxos essenciais em telas móveis e tratar nomes longos e conteúdo de previsão incompleto.

## Open Questions

- A busca aceitará somente nome de cidade ou também país, estado, código postal e localização atual?
- Quais informações devem distinguir cidades com o mesmo nome, e como o usuário confirma a localidade correta?
- Os cinco dias incluem o dia atual ou são os cinco dias seguintes? A previsão deve ser diária ou apresentar intervalos horários?
- Quais campos devem ser exibidos no clima atual e em cada dia da previsão?
- A preferência entre Celsius e Fahrenheit deve persistir após recarregar a página ou encerrar uma sessão?
- Se uma nova busca falhar após resultados válidos estarem visíveis, os resultados anteriores devem permanecer visíveis ou ser removidos?
- Qual é o limite de espera aceitável para uma consulta e deve haver uma ação para tentar novamente?
- Como indicar o horário da última atualização e qual idade máxima permite apresentar dados como atuais?
- Quais navegadores, idiomas, fusos horários e critérios mensuráveis de acessibilidade devem ser suportados?

## Out of Scope

- Previsões para períodos maiores que cinco dias.
- Mapas, radar meteorológico e visualizações geográficas.
- Alertas, notificações ou recomendações de atividades.
- Contas de usuário, sincronização, favoritos ou histórico persistente de cidades.
- Localização automática, até que seja confirmada como requisito.
- Definição de provedor de dados, arquitetura ou tecnologias de implementação, que pertencem às etapas seguintes do fluxo SDD.

## Rastreabilidade

| História | Requisitos relacionados |
| --- | --- |
| US-01 | RF-01, RF-02 |
| US-02 | RF-03, RF-06 |
| US-03 | RF-04, RF-06 |
| US-04 | RF-05 |
| US-05 | RF-07 |
| US-06 | RF-06 |