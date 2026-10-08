from django.urls import path

from desafio.api_views import (
    AvaliarEntregaView,
    CadastroEmpresaView,
    CadastroEstudanteView,
    DashboardView,
    DesafioDetalheView,
    DesafiosView,
    DemonstrarInteresseView,
    EnviarEntregaView,
    LoginView,
    LogoutView,
    MeuPerfilView,
    MinhaContaView,
    OportunidadesView,
    ParticipacoesView,
    ParticiparDesafioView,
    ReconhecimentosView,
    ResponderOportunidadeView,
)

app_name = 'api'

urlpatterns = [
    path('auth/register/student/', CadastroEstudanteView.as_view(), name='register-student'),
    path('auth/register/company/', CadastroEmpresaView.as_view(), name='register-company'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MinhaContaView.as_view(), name='me'),
    path('profile/', MeuPerfilView.as_view(), name='profile'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('challenges/', DesafiosView.as_view(), name='challenges'),
    path('challenges/<uuid:pk>/', DesafioDetalheView.as_view(), name='challenge-detail'),
    path(
        'challenges/<uuid:pk>/participate/',
        ParticiparDesafioView.as_view(),
        name='challenge-participate',
    ),
    path('participations/', ParticipacoesView.as_view(), name='participations'),
    path(
        'participations/<uuid:pk>/submit/',
        EnviarEntregaView.as_view(),
        name='participation-submit',
    ),
    path(
        'participations/<uuid:pk>/evaluate/',
        AvaliarEntregaView.as_view(),
        name='participation-evaluate',
    ),
    path(
        'participations/<uuid:pk>/interest/',
        DemonstrarInteresseView.as_view(),
        name='participation-interest',
    ),
    path('recognitions/', ReconhecimentosView.as_view(), name='recognitions'),
    path('opportunities/', OportunidadesView.as_view(), name='opportunities'),
    path(
        'opportunities/<uuid:pk>/respond/',
        ResponderOportunidadeView.as_view(),
        name='opportunity-respond',
    ),
]
