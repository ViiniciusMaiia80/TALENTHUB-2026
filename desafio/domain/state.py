from abc import ABC, abstractmethod
from django.core.exceptions import ValidationError
from django.utils import timezone
from desafio.models import Participacao, Statusentrega, Avaliacao

# Interface Abstrata do Estado (GoF State)
class ParticipacaoState(ABC):
    @abstractmethod
    def enviar_entrega(self, participacao: Participacao, url: str):
        pass

    @abstractmethod
    def avaliar(self, participacao: Participacao, nota: float, feedback: str):
        pass


# Estado 1: Inscrito / Em Andamento
class InscritoState(ParticipacaoState):
    def enviar_entrega(self, participacao: Participacao, url: str):
        status_submetido, _ = Statusentrega.objects.get_or_create(status="Submetido")
        participacao.entrega_url = url
        participacao.data_entrega = timezone.now()
        participacao.status = status_submetido
        participacao.save()

    def avaliar(self, participacao: Participacao, nota: float, feedback: str):
        raise ValidationError("Não é possível avaliar uma participação que ainda não foi submetida.")


# Estado 2: Submetido / Aguardando Avaliação
class SubmetidoState(ParticipacaoState):
    def enviar_entrega(self, participacao: Participacao, url: str):
        raise ValidationError("A entrega já foi realizada e não pode ser reenviada.")

    def avaliar(self, participacao: Participacao, nota: float, feedback: str):
        status_avaliado, _ = Statusentrega.objects.get_or_create(status="Avaliado")
        
        # Cria a avaliação associada no BD
        Avaliacao.objects.create(
            nota=nota,
            feedback=feedback,
            data_avaliacao=timezone.now(),
            participacao=participacao
        )
        
        participacao.status = status_avaliado
        participacao.save()


# Estado 3: Avaliado / Concluído
class AvaliadoState(ParticipacaoState):
    def enviar_entrega(self, participacao: Participacao, url: str):
        raise ValidationError("Participação já finalizada e avaliada.")

    def avaliar(self, participacao: Participacao, nota: float, feedback: str):
        raise ValidationError("Esta participação já possui uma avaliação.")


# Contexto do Padrão State
class ParticipacaoContext:
    def __init__(self, participacao: Participacao):
        self.participacao = participacao
        self._state = self._mapear_estado()

    def _mapear_estado(self) -> ParticipacaoState:
        status_nome = self.participacao.status.status if self.participacao.status else "Inscrito"
        
        mapa_estados = {
            "Inscrito": InscritoState(),
            "Submetido": SubmetidoState(),
            "Avaliado": AvaliadoState(),
        }
        return mapa_estados.get(status_nome, InscritoState())

    def enviar_entrega(self, url: str):
        self._state.enviar_entrega(self.participacao, url)
        self._state = self._mapear_estado()  # Atualiza para o novo estado

    def avaliar(self, nota: float, feedback: str):
        self._state.avaliar(self.participacao, nota, feedback)
        self._state = self._mapear_estado()  # Atualiza para o novo estado