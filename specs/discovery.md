# Especificação do Weather App

## Overview

Aplicação de previsão do tempo para que usuários consultem o clima atual e a previsão para os próximos cinco dias de uma cidade. A experiência deve permitir buscar cidades, alternar a unidade de temperatura entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

## Functional Requirements

- **FR-01 — Buscar cidade:** o usuário deve poder informar o nome de uma cidade e iniciar uma busca por suas condições meteorológicas.
- **FR-02 — Identificar a cidade:** o sistema deve apresentar a cidade selecionada de forma que o usuário consiga confirmar para qual local os dados exibidos se referem.
- **FR-03 — Exibir clima atual:** após uma busca bem-sucedida, o sistema deve mostrar as condições atuais da cidade selecionada.
- **FR-04 — Exibir previsão:** após uma busca bem-sucedida, o sistema deve mostrar a previsão para cinco dias.
- **FR-05 — Alternar unidade:** o usuário deve poder alternar entre Celsius e Fahrenheit; as temperaturas apresentadas devem refletir a unidade selecionada.
- **FR-06 — Informar estados da consulta:** o sistema deve comunicar quando a busca está em andamento, quando não há resultados e quando ocorre uma falha que impede a exibição dos dados.

## User Stories

- Como usuário, quero buscar uma cidade para consultar o tempo no local de meu interesse.
- Como usuário, quero ver o clima atual para entender as condições do momento.
- Como usuário, quero consultar a previsão de cinco dias para planejar atividades próximas.
- Como usuário, quero alternar entre Celsius e Fahrenheit para ler as temperaturas na unidade que prefiro.
- Como usuário de dispositivo móvel, quero consultar as mesmas informações em uma tela pequena para usar o serviço fora de casa.

## Acceptance Criteria

### Busca e identificação da cidade

- Dado que o usuário informe uma cidade válida, quando iniciar a busca e a consulta for concluída, então o sistema deve identificar a cidade dos dados apresentados.
- Dado que a busca não encontre uma cidade correspondente, quando a consulta terminar, então o sistema deve informar que não há resultados e não deve apresentar dados de outra cidade como se fossem correspondentes.
- Dado que o usuário envie uma busca sem texto, então o sistema não deve iniciar uma consulta e deve manter uma interface compreensível.

### Clima atual e previsão

- Dada uma busca bem-sucedida, então o sistema deve exibir as condições meteorológicas atuais da cidade selecionada.
- Dada uma busca bem-sucedida, então o sistema deve exibir uma previsão que cubra os cinco dias solicitados.
- Enquanto os dados estiverem sendo obtidos, então o sistema deve indicar que a consulta está em andamento.
- Se os dados não puderem ser obtidos, então o sistema deve informar a falha sem apresentar os dados como atuais.

### Unidade de temperatura

- Dado que o usuário selecione Celsius, então todas as temperaturas exibidas devem estar em Celsius.
- Dado que o usuário selecione Fahrenheit, então todas as temperaturas exibidas devem estar em Fahrenheit.
- Ao alternar a unidade, então os dados meteorológicos da cidade e do período selecionados devem continuar identificáveis.

### Uso em dispositivos móveis

- Em uma tela móvel, então o usuário deve conseguir buscar uma cidade, consultar o clima atual e a previsão, e alternar a unidade sem conteúdo ou controles essenciais ficarem inacessíveis.

## Non-Functional Requirements

- **Responsividade:** as funções de busca, consulta e alternância de unidade devem estar disponíveis em dispositivos móveis.
- **Usabilidade:** os estados de carregamento, ausência de resultados e falha devem ser distinguíveis.
- **Acessibilidade:** campos, ações e informações meteorológicas devem ter nomes e estrutura compreensíveis para tecnologias assistivas; os controles devem ser operáveis por teclado.
- **Consistência:** a unidade selecionada deve ser aplicada de maneira uniforme a todas as temperaturas visíveis.
- **Atualidade dos dados:** informações apresentadas como clima atual devem corresponder à consulta mais recente concluída com sucesso; a tolerância de atualização ainda precisa ser definida.

## Edge Cases

- Busca vazia ou contendo apenas espaços.
- Cidade não encontrada ou nome que corresponda a mais de uma cidade.
- Falha de rede, indisponibilidade do serviço meteorológico ou resposta inválida.
- Consulta que demora ou expira sem resposta.
- Alternância de unidade durante uma consulta ou após a exibição dos resultados.
- Previsão indisponível ou incompleta para um ou mais dos cinco dias.
- Tela móvel estreita, com conteúdo longo ou nomes de cidade extensos.

## Assumptions

- A previsão de cinco dias se refere a cinco dias consecutivos a partir da data da consulta; a inclusão do dia atual precisa ser confirmada.
- A busca é feita pelo nome da cidade; suporte a país, estado, coordenadas ou localização automática não foi solicitado.
- Clima atual e previsão devem estar associados à mesma cidade selecionada.
- Os requisitos não especificam provedor, fontes de dados, limites de atualização ou política de persistência da preferência de unidade.

## Risks

- **Ambiguidade de nomes de cidades:** nomes iguais podem apontar para locais diferentes. Mitigação: definir como apresentar e selecionar resultados desambiguados.
- **Dependência de dados externos:** indisponibilidade, lentidão ou limites do provedor podem impedir consultas. Mitigação: definir estados de erro, timeout e comportamento para nova tentativa.
- **Interpretação de “cinco dias”:** diferentes convenções podem produzir períodos distintos. Mitigação: confirmar o intervalo e a granularidade esperados.
- **Conversão ou apresentação inconsistente:** alternar a unidade pode deixar valores ou rótulos divergentes. Mitigação: exigir consistência entre todos os valores e unidades apresentados.
- **Legibilidade em telas pequenas:** previsão e controles podem não caber em larguras reduzidas. Mitigação: validar os fluxos essenciais em dispositivos móveis.
- **Dados percebidos como atuais quando estão desatualizados:** sem indicação de atualização, o usuário pode confiar em informações antigas. Mitigação: definir política de atualização e, se necessário, exibir o horário da última atualização.

## Open Questions

- A busca deve aceitar apenas o nome da cidade ou também país, estado, CEP ou localização atual?
- Como o usuário deve escolher quando houver cidades com o mesmo nome?
- “Previsão de cinco dias” inclui hoje ou os cinco dias seguintes? Deve mostrar dados diários ou horários?
- Quais informações compõem o clima atual e cada dia da previsão (por exemplo, mínima, máxima, condição e chance de precipitação)?
- A preferência de Celsius/Fahrenheit deve persistir entre visitas ou sessões?
- O que deve acontecer se uma nova busca falhar depois de já haver resultados válidos na tela?
- Quais são os limites aceitáveis para tempo de resposta e atualização dos dados?
- Há requisitos de navegadores, idiomas, fuso horário ou acessibilidade além do uso móvel?

## Out of Scope

- Alertas meteorológicos ou notificações.
- Previsão além de cinco dias.
- Mapas, radar ou visualizações geográficas.
- Contas de usuário, sincronização ou lista de cidades favoritas.
- Recomendações ou planejamento de atividades com base no clima.
- Localização automática, até que seja confiruma especificação de produto completamada como requisito.