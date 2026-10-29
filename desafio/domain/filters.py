from abc import ABC, abstractmethod

from django.db.models import Q, QuerySet
from rest_framework.exceptions import ValidationError

from desafio.models import Desafio


class DesafioFilterStrategy(ABC):
    @abstractmethod
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        raise NotImplementedError


class BuscaDesafioStrategy(DesafioFilterStrategy):
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        return desafios.filter(
            Q(titulo__icontains=valor)
            | Q(descricao__icontains=valor)
            | Q(tecnologias__icontains=valor)
            | Q(area__icontains=valor)
            | Q(empresa__razao_social__icontains=valor)
        )


class AreaDesafioStrategy(DesafioFilterStrategy):
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        return desafios.filter(area__icontains=valor)


class NivelDesafioStrategy(DesafioFilterStrategy):
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        return desafios.filter(nivel__nivel__iexact=valor)


class TecnologiaDesafioStrategy(DesafioFilterStrategy):
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        return desafios.filter(tecnologias__icontains=valor)


class EmpresaDesafioStrategy(DesafioFilterStrategy):
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        return desafios.filter(empresa__razao_social__icontains=valor)


class PrazoDesafioStrategy(DesafioFilterStrategy):
    def aplicar(self, desafios: QuerySet[Desafio], valor: str) -> QuerySet[Desafio]:
        try:
            dias = int(valor)
        except ValueError as error:
            raise ValidationError({'prazo': 'Informe o prazo em dias.'}) from error
        return desafios.filter(prazo=dias)


FILTROS_DESAFIOS = {
    'area': AreaDesafioStrategy(),
    'nivel': NivelDesafioStrategy(),
    'tecnologia': TecnologiaDesafioStrategy(),
    'empresa': EmpresaDesafioStrategy(),
    'prazo': PrazoDesafioStrategy(),
}
