# TALENTHUB-2026
O TalentHub é uma plataforma que aproxima estudantes universitários e empresas por meio de desafios práticos. O backend usa Django, Django REST Framework e PostgreSQL.

## API

Todos os endpoints ficam sob `/api/` e recebem/enviam JSON. As rotas de leitura de desafios são públicas. As demais operações exigem o cabeçalho `Authorization: Bearer <token>` retornado no cadastro ou login.

| Método | Rota | Ação |
| --- | --- | --- |
| `POST` | `/api/auth/register/student/` | Cadastrar estudante (`nome`, `email`, `senha`, `curso`, `instituicao`, `area_interesse`, `competencias`) |
| `POST` | `/api/auth/register/company/` | Cadastrar empresa (`razao_social`, `email`, `senha`, `area_atuacao`, `descricao`; `cnpj` opcional) |
| `POST` | `/api/auth/login/` | Entrar com `email` e `senha` |
| `POST` | `/api/auth/logout/` | Revogar o token atual |
| `GET` | `/api/auth/me/` | Consultar conta e tipo de perfil |
| `GET`, `PATCH` | `/api/profile/` | Consultar/editar o próprio perfil |
| `GET` | `/api/dashboard/` | Indicadores e dados do dashboard conforme o perfil |
| `GET`, `POST` | `/api/challenges/` | Buscar desafios ou publicar um desafio como empresa |
| `GET`, `PATCH`, `DELETE` | `/api/challenges/{id}/` | Consultar ou gerenciar um desafio próprio |
| `POST` | `/api/challenges/{id}/participate/` | Estudante inicia participação |
| `GET` | `/api/participations/` | Listar participações próprias ou da empresa |
| `POST` | `/api/participations/{id}/submit/` | Estudante envia `entrega_url` |
| `POST` | `/api/participations/{id}/evaluate/` | Empresa envia `nota` (0–10), `feedback` e reconhecimento opcional |
| `POST` | `/api/participations/{id}/interest/` | Empresa envia convite profissional após avaliar |
| `GET` | `/api/recognitions/` | Listar reconhecimentos do estudante |
| `GET` | `/api/opportunities/` | Listar convites enviados ou recebidos |
| `POST` | `/api/opportunities/{id}/respond/` | Estudante responde com `Aceito` ou `Recusado` |

A busca de desafios aceita os parâmetros `q`, `area`, `nivel`, `tecnologia`, `prazo` (dias) e `empresa`. `competencias` e `tecnologias` são listas JSON; no banco são persistidas como texto separado por vírgulas.

Exemplo de publicação:

```json
{
  "titulo": "Dashboard de Indicadores de Vendas",
  "descricao": "Crie um painel interativo para apoiar decisões comerciais.",
  "area": "Dados",
  "prazo": 7,
  "tecnologias": ["Python", "SQL", "Power BI"],
  "objetivo": "Apresentar indicadores de vendas.",
  "requisitos": "Permitir filtros por período e região.",
  "entregaveis": "Projeto e documentação.",
  "criterios_avaliativos": "Qualidade, clareza e funcionalidade.",
  "nivel": "Intermediário"
}
```

Configure `CORS_ALLOWED_ORIGINS` com a origem do frontend. Por padrão, a API permite a origem do protótipo Lovable. Instale as dependências e execute as migrações com:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

As contas guardam senhas usando os hashers do Django; os tokens bearer são aleatórios e armazenados no banco somente como hash. O acesso a perfis, entregas, avaliações e oportunidades é limitado ao estudante ou à empresa responsável.
