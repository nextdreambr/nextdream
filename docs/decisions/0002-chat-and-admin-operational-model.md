# ADR 0002 — Chat e Operação Admin com REST + Polling

- Status: Aceito
- Data: 2026-04-08

## Contexto

A plataforma precisava remover telas e fluxos mockados de `chat` e `admin` sem bloquear entrega por dependências de infraestrutura realtime.

Também era necessário manter compatibilidade com o ambiente local atual (Docker + Postgres) e com o ambiente de testes em memória (`sqljs`).

## Decisão

1. Chat implementado com API REST + polling no frontend (intervalo de 5s), em vez de websocket nesta fase.
2. Módulo admin implementado em modo operacional seguro:
   - listagens reais para visão operacional,
   - ações moderadas e auditáveis (suspender usuário, alterar status, encerrar chat, resolver denúncia),
   - sem ações destrutivas permanentes nesta etapa.
3. Persistência com TypeORM mantendo compatibilidade entre bancos:
   - colunas de data sensíveis com tipo dinâmico por ambiente (`timestamp` em Postgres, `datetime` em `sqljs` para testes).

## Consequências

- Entrega imediata dos fluxos principais de chat e admin sem dependência de infraestrutura realtime.
- Operação administrativa funcional com trilha de auditoria.
- Menor risco de regressão em testes e desenvolvimento local.
- Realtime (WebSocket/Supabase Realtime) permanece como evolução planejada de fase futura.
