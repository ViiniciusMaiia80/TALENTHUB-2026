from unittest.mock import Mock

from django.test import SimpleTestCase
from rest_framework.exceptions import ValidationError

from desafio.domain.filters import (
    AreaDesafioStrategy,
    BuscaDesafioStrategy,
    EmpresaDesafioStrategy,
    NivelDesafioStrategy,
    PrazoDesafioStrategy,
    TecnologiaDesafioStrategy,
)


class DesafioFilterStrategyTestCase(SimpleTestCase):
    def setUp(self):
        self.queryset = Mock()
        self.queryset.filter.return_value = self.queryset

    def test_strategy_aplica_filtro_de_area(self):
        AreaDesafioStrategy().aplicar(self.queryset, 'Dados')

        self.queryset.filter.assert_called_once_with(area__icontains='Dados')

    def test_strategy_aplica_filtro_de_nivel_sem_diferenciar_maiusculas(self):
        NivelDesafioStrategy().aplicar(self.queryset, 'intermediário')

        self.queryset.filter.assert_called_once_with(nivel__nivel__iexact='intermediário')

    def test_strategy_aplica_filtro_de_tecnologia(self):
        TecnologiaDesafioStrategy().aplicar(self.queryset, 'Python')

        self.queryset.filter.assert_called_once_with(tecnologias__icontains='Python')

    def test_strategy_aplica_filtro_de_empresa(self):
        EmpresaDesafioStrategy().aplicar(self.queryset, 'Tech')

        self.queryset.filter.assert_called_once_with(empresa__razao_social__icontains='Tech')

    def test_strategy_aplica_busca_textual_em_multiplos_campos(self):
        BuscaDesafioStrategy().aplicar(self.queryset, 'Python')

        self.queryset.filter.assert_called_once()

    def test_strategy_valida_prazo_e_filtra_por_dias(self):
        PrazoDesafioStrategy().aplicar(self.queryset, '7')

        self.queryset.filter.assert_called_once_with(prazo=7)

    def test_strategy_rejeita_prazo_invalido(self):
        with self.assertRaises(ValidationError):
            PrazoDesafioStrategy().aplicar(self.queryset, 'uma semana')
