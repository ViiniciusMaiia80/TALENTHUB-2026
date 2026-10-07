from abc import ABC, abstractmethod
from desafio.models import Empresa, Niveis, Statusentrega, Desafio

class DesafioFactory(ABC):
    @abstractmethod
    def criar_desafio(self) -> Desafio:
        pass

class DesafioAtivoFactory(DesafioFactory):
    def criar_desafio(self) -> Desafio:
        empresa, _ = Empresa.objects.get_or_create(cnpj="12345678000199", defaults={"razao_social": "Tech Corp"})
        nivel, _ = Niveis.objects.get_or_create(nivel="Avançado")
        status, _ = Statusentrega.objects.get_or_create(status="Aberto")
        
        return Desafio.objects.create(
            titulo="Desafio Backend Python",
            descricao="Desenvolver API",
            area="TI",
            prazo=30,
            tecnologias="Python, Django",
            objetivo="Testar ORM",
            requisitos="Django 4+",
            entregaveis="Repositório Git",
            criterios_avaliativos="Testes unitários",
            status=status,
            nivel=nivel,
            empresa=empresa
        )