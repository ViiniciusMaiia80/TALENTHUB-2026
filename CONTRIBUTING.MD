# Guia de contribuição

Obrigado por contribuir com o TalentHub! Este documento define o fluxo de trabalho, os padrões de código e as regras de versionamento para manter o desenvolvimento colaborativo organizado.

## 1. Antes de começar

- Confira as issues e discussões existentes para evitar trabalho duplicado.
- Para mudanças relevantes, alinhe a proposta com a equipe antes de implementá-la.
- Mantenha cada contribuição focada em um objetivo. Mudanças sem relação devem ser enviadas separadamente.

## 2. Fluxo de trabalho

O projeto adota um fluxo inspirado no **Git Flow**:

- `main`: versão estável do projeto. Deve conter apenas mudanças revisadas e prontas para entrega.
- `develop`: branch de integração do trabalho aprovado para a próxima versão.
- `Branches de trabalho`: criadas a partir de `develop` para funcionalidades, correções, documentação e outras tarefas.
- Correções urgentes em produção: criadas a partir de `main` e integradas de volta em `main` e `develop`.

### Passos para contribuir

1. Atualize sua branch base:

   ```bash
   git switch develop
   git pull origin develop
   ```

2. Crie uma branch de trabalho seguindo os padrões da seção seguinte.
3. Faça alterações pequenas e coesas. Execute os testes e verificações pertinentes.
4. Envie a branch ao repositório remoto e abra um Pull Request para `develop`. Para uma correção urgente iniciada em `main`, abra o Pull Request para `main` e integre a correção também em `develop`.
5. Descreva o problema resolvido, as alterações feitas e como validar. Inclua capturas de tela quando a mudança alterar a interface.
6. Aguarde a revisão, responda aos comentários e atualize o Pull Request até que as verificações sejam aprovadas.

Não envie alterações diretamente para `main` ou `develop`.

## 3. Nomeação de branches

Use nomes curtos, em minúsculas, sem acentos ou espaços, com palavras separadas por hífen:

| Prefixo | Uso | Exemplo |
| --- | --- | --- |
| `feature/` | Nova funcionalidade | `feature/filtro-de-desafios` |
| `fix/` | Correção de defeito não urgente | `fix/validacao-de-entrega` |
| `hotfix/` | Correção urgente da versão estável | `hotfix/erro-no-login` |
| `docs/` | Documentação | `docs/guia-de-contribuicao` |
| `test/` | Inclusão ou ajuste de testes | `test/fluxo-de-participacao` |
| `refactor/` | Refatoração sem mudança intencional de comportamento | `refactor/servico-de-autenticacao` |
| `chore/` | Manutenção e tarefas auxiliares | `chore/atualiza-dependencias` |

Crie branches a partir da base indicada pelo fluxo. Evite nomes genéricos, como `alteracoes` ou `teste`.

## 4. Commits e versionamento

### 4.1 Convenção de commits

Use **Conventional Commits**:

```text
<tipo>(<escopo opcional>): <descrição no imperativo>
```

Escreva a descrição em português, de forma concisa, sem ponto final. Use um escopo quando ajudar a identificar a área afetada.

Tipos recomendados:

| Tipo | Quando usar |
| --- | --- |
| `feat` | Adiciona funcionalidade |
| `fix` | Corrige um defeito |
| `docs` | Altera documentação |
| `test` | Adiciona ou modifica testes |
| `refactor` | Reorganiza código sem alterar comportamento |
| `style` | Faz ajustes de formatação sem alterar comportamento |
| `build` | Altera dependências ou o processo de build |
| `ci` | Altera configuração de integração contínua |
| `chore` | Realiza manutenção que não se encaixa nos tipos anteriores |

Exemplos:

```text
feat(desafios): adicionar filtro por tecnologia
fix(auth): validar token expirado
docs: documentar configuração local
test(api): cobrir envio de entrega duplicada
```

Para mudanças incompatíveis com versões anteriores, acrescente `!` após o tipo ou escopo e explique a quebra no corpo ou rodapé do commit:

```text
feat(api)!: alterar formato da resposta de desafios

BREAKING CHANGE: a resposta passa a agrupar os dados em `results`.
```

Faça commits com uma única intenção, sem incluir arquivos gerados, segredos, credenciais ou alterações alheias à tarefa.

### 4.2 Versionamento de releases

As versões publicadas seguem **Versionamento Semântico** (`MAJOR.MINOR.PATCH`):

- `MAJOR`: mudança incompatível com versões anteriores.
- `MINOR`: funcionalidade nova compatível.
- `PATCH`: correção compatível.

O responsável pela release atualiza a versão e prepara a publicação a partir de mudanças integradas e revisadas. Commits isolados não exigem alteração do número da versão.

## 5. Qualidade e testes

Antes de abrir ou atualizar um Pull Request:

- Execute os testes do backend:

  ```bash
  python manage.py test
  ```

- Se houver mudanças no frontend, gere o build para verificar a compilação:

  ```bash
  npm run build
  ```

- Revise o diff e remova código temporário, arquivos gerados e informações sensíveis.
- Atualize a documentação diretamente relacionada à mudança.

Novas funcionalidades e correções devem incluir ou atualizar testes quando aplicável. Não considere uma verificação aprovada se ela não foi executada; informe no Pull Request qualquer limitação.

## 6. Revisão de Pull Requests

- Mantenha o Pull Request pequeno o suficiente para uma revisão objetiva.
- Vincule a issue relacionada, se houver.
- Explique mudanças de comportamento, decisões relevantes e passos para testar.
- Resolva conflitos com a branch de destino sem descartar alterações de outras pessoas.
- Incorpore feedback de revisão antes da integração.

## 7. Segurança

- Nunca inclua senhas, tokens, chaves, dados pessoais ou configurações locais com informações sensíveis em commits.
- Use variáveis de ambiente para configurações secretas e reporte vulnerabilidades pelos canais privados definidos pela equipe.

