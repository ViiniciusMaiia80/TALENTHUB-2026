# TalentHub

O TalentHub conecta estudantes universitários e empresas por meio de desafios práticos. Estudantes podem desenvolver habilidades e demonstrar suas competências; empresas podem propor desafios, avaliar entregas e identificar talentos.

## Funcionalidades

- Cadastro e autenticação de estudantes e empresas.
- Exploração, busca e filtragem de desafios.
- Publicação e gerenciamento de desafios por empresas.
- Participação de estudantes e envio de entregas.
- Avaliação de entregas com nota e feedback.
- Emissão de reconhecimentos e envio de oportunidades profissionais.
- Painéis e edição de perfil específicos para cada tipo de conta.

## Tecnologias

- **Frontend:** React 18, React Router e Vite.
- **Backend:** Python, Django e Django REST Framework.
- **Banco de dados:** PostgreSQL.
- **Autenticação:** tokens Bearer próprios da API.

## Pré-requisitos

- Python e `pip`.
- Node.js e `npm`.
- PostgreSQL.

## Configuração e execução

### 1. Backend

Na raiz do projeto, crie e ative um ambiente virtual e instale as dependências:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

No Windows, ative o ambiente com:

```powershell
.venv\Scripts\activate
```

O Django precisa de uma `SECRET_KEY`. Defina-a no ambiente ou em um arquivo `.env` na raiz do projeto. Também é possível configurar `DEBUG` e `CORS_ALLOWED_ORIGINS`; as origens CORS padrão incluem o frontend local em `http://localhost:5173` e `http://127.0.0.1:5173`.

O backend está configurado para usar PostgreSQL. Crie o banco de dados e confira os parâmetros de conexão em `TALENTHUB/settings.py` antes de iniciar. Em seguida, aplique as migrações e execute a API:

```bash
python manage.py migrate
python manage.py runserver
```

A API ficará disponível em `http://127.0.0.1:8000`, e a interface administrativa do Django em `http://127.0.0.1:8000/admin/`.

### 2. Frontend

Em outro terminal, instale os pacotes e inicie o Vite:

```bash
npm install
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente `http://localhost:5173`. Durante o desenvolvimento, as requisições para `/api` são encaminhadas para `http://127.0.0.1:8000`.

Para usar outro endereço de backend durante o desenvolvimento, defina `DJANGO_API_URL`. Para apontar o frontend diretamente a uma API, defina `VITE_API_URL` (por exemplo, `https://api.exemplo.com/api`) e permita a origem do frontend em `CORS_ALLOWED_ORIGINS`. O arquivo `.env.frontend.example` contém um exemplo de configuração para o Vite.

### Build de produção

Gere a versão de produção do frontend com:

```bash
npm run build
```

Os arquivos compilados são gerados no diretório `dist/`. Para visualizar esse build localmente, use `npm run preview`.

## Testes

Execute os testes do backend com:

```bash
python manage.py test
```

Os testes cobrem a API, os modelos e as regras de domínio de participação e desafios.

## API

Todos os endpoints da API usam o prefixo `/api/` e trabalham com JSON. As rotas de leitura de desafios são públicas. Para as demais operações autenticadas, envie o token retornado no cadastro ou login no cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/register/student/` | Cadastra estudante (`nome`, `email`, `senha`, `curso`, `instituicao`; `area_interesse` e `competencias` são opcionais). |
| `POST` | `/api/auth/register/company/` | Cadastra empresa (`razao_social`, `email`, `senha`, `descricao`, `area_atuacao`; `cnpj` é opcional). |
| `POST` | `/api/auth/login/` | Autentica com `email` e `senha`. |
| `POST` | `/api/auth/logout/` | Revoga o token atual. |
| `GET` | `/api/auth/me/` | Retorna os dados da conta autenticada. |
| `GET`, `PATCH` | `/api/profile/` | Consulta ou atualiza o próprio perfil. |
| `GET` | `/api/dashboard/` | Retorna indicadores de acordo com o perfil. |
| `GET`, `POST` | `/api/challenges/` | Lista desafios ou publica um desafio como empresa. |
| `GET`, `PATCH`, `DELETE` | `/api/challenges/{id}/` | Consulta ou gerencia um desafio próprio. |
| `POST` | `/api/challenges/{id}/participate/` | Inicia uma participação como estudante. |
| `GET` | `/api/participations/` | Lista participações relacionadas à conta. |
| `POST` | `/api/participations/{id}/submit/` | Envia uma entrega (`entrega_url`) como estudante. |
| `POST` | `/api/participations/{id}/evaluate/` | Avalia uma entrega como empresa (`nota` de 0 a 10, `feedback` e reconhecimento opcional). |
| `POST` | `/api/participations/{id}/interest/` | Envia uma oportunidade profissional relativa à participação. |
| `GET` | `/api/recognitions/` | Lista reconhecimentos do estudante. |
| `GET` | `/api/opportunities/` | Lista oportunidades enviadas ou recebidas. |
| `POST` | `/api/opportunities/{id}/respond/` | Responde a uma oportunidade com `Aceito` ou `Recusado`. |

A listagem de desafios aceita os filtros `q`, `area`, `nivel`, `tecnologia`, `prazo` (em dias) e `empresa`. Um desafio pode ser publicado com um corpo semelhante a:

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

## Estrutura do projeto

```text
TALENTHUB-2026/
├── TALENTHUB/       # Configurações e rotas principais do Django
├── desafio/         # API, modelos, autenticação e regras de domínio
├── src/             # Aplicação React
├── manage.py        # Comandos de gerenciamento do Django
├── requirements.txt # Dependências Python
└── package.json     # Scripts e dependências do frontend
```
