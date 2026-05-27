# Home Redesign Playbook

This playbook prepares a future implementation of the NextDream home. It is not
an instruction to implement the home immediately. It defines the expected
structure, tasks, and validation path.

## Recommended Home Structure

1. Hero acolhedor.
2. O que e o NextDream.
3. Como funciona.
4. Caminhos principais:
   - Compartilhar sonho.
   - Apoiar alguem.
   - Instituicao ou comunidade.
5. Seguranca, privacidade e consentimento.
6. Momentos possiveis.
7. Instituicoes e comunidades.
8. Footer.

## Narrative Goal

The home should quickly communicate:

- What NextDream is.
- That it is not about money.
- That it is about presence, time, skills, company, and experiences.
- That care, safety, privacy, and consent are central.
- That the user can share a dream, support someone, or connect as an
  institution/community.
- That people in delicate health moments are treated with dignity.

The desired feeling:

> Aqui existe cuidado. Aqui minha historia sera tratada com respeito.

## Minimum Future Implementation Tasks

### Tarefa 1 - Localizar estrutura da home

- Identificar framework.
- Identificar rota da home.
- Identificar componentes.
- Identificar sistema de estilos.
- Identificar assets.

Acceptance criteria:

- Correct files are identified.
- No UI change happens before the structure is understood.

### Tarefa 2 - Redesenhar hero

- Headline curta.
- Subheadline clara.
- CTA principal.
- CTA secundario.
- Mensagem de confianca.
- Visual acolhedor.

Acceptance criteria:

- The page is understandable within 5 seconds.
- It is clear that NextDream is not about money.
- CTAs are clear.
- Visual direction is not corporate or hospital-like.
- Mobile and desktop work.

### Tarefa 3 - Implementar bloco "O que e o NextDream"

- Explicar que nao e dinheiro.
- Explicar presenca, tempo, habilidades e experiencias.
- Explicar ponte humana.

Acceptance criteria:

- Copy is short.
- The proposal is clear.
- No institutional or manipulative tone.

### Tarefa 4 - Implementar "Como funciona"

- Quatro etapas simples.
- Linguagem clara.
- Pouco texto.

Suggested steps:

1. Pessoa ou familia compartilha um sonho.
2. Proposta e avaliada com cuidado.
3. Apoiadores oferecem presenca, tempo ou habilidades.
4. Conexao acontece com respeito, seguranca e consentimento.

### Tarefa 5 - Implementar caminhos principais

- Compartilhar sonho.
- Apoiar alguem.
- Instituicao/comunidade.

Acceptance criteria:

- Each audience understands its path.
- CTAs point to existing routes.
- Layout works on mobile.

### Tarefa 6 - Implementar seguranca, privacidade e consentimento

- Dados protegidos.
- Contato apos aceite.
- Nenhuma exposicao sem consentimento.
- Pessoa mantem controle sobre sua historia.
- Cuidado com historias.

Acceptance criteria:

- Trust is clear without legal heaviness.
- Consent and privacy are visible before conversion.

### Tarefa 7 - Implementar momentos possiveis

- Exemplos leves.
- Sem dramatizacao.
- Sem apelo emocional.

Examples:

- Uma tarde com musica.
- Uma visita com conversa.
- Um desenho entregue com carinho.
- Uma experiencia simples em familia.
- Companhia sem pressa.
- Uma habilidade compartilhada.

### Tarefa 8 - Implementar bloco para instituicoes e comunidades

- Tom colaborativo.
- Seguro.
- Nao comercial.
- Nao burocratico.

Acceptance criteria:

- Institutions understand their role as responsible facilitators.
- The section does not feel like B2B sales.

### Tarefa 9 - Ajustar footer

- Links essenciais.
- Contato.
- Termos.
- Privacidade.
- Frase curta de cuidado.

Acceptance criteria:

- Footer closes with trust.
- Links are clear.
- Visual style is consistent.

### Tarefa 10 - Responsividade

- Mobile.
- Tablet, se aplicavel.
- Desktop.

Acceptance criteria:

- Text does not overflow.
- CTAs remain visible.
- Images or compositions adapt.
- Section rhythm remains clear.

### Tarefa 11 - Acessibilidade basica

- Contraste.
- Alt text.
- Labels.
- Headings.
- Foco visivel.

Acceptance criteria:

- No obvious accessibility issue.
- Interactive elements have clear names.
- Relevant images are described respectfully.

### Tarefa 12 - QA interno

- Funcional.
- Visual.
- Responsivo.
- Acessibilidade.
- Medico/etico.
- Copy.
- Performance basica.

Acceptance criteria:

- QA returns `Aprovado pelo QA`, or Project Manager creates/reopens tasks for
  any failure or blocking reservation.

### Tarefa 13 - Review PO/PM

- Clareza.
- Proposta de valor.
- CTAs.
- Jornadas.
- Coerencia com o NextDream.

Acceptance criteria:

- PO/PM approves.
- No undue promise remains.
- The home communicates NextDream accurately.

## Future Implementation Prompt Requirements

Any future implementation prompt should explicitly require:

- Use `frontend-design`.
- Execute only Project Manager-created tasks.
- Preserve PO/PM and Medical Reviewer direction.
- Do not create emotionally manipulative copy.
- Do not use explicit suffering images.
- Prioritize comfort, presence, safety, privacy, and dignity.
- Validate mobile and desktop.
- Validate accessibility basics.
- Run repository gates.
- Send work to QA before PO/PM acceptance.
