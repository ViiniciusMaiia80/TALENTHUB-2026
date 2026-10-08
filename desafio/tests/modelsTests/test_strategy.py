from django.test import TestCase
from desafio.domain.strategy import DesafioAtivoFactory
from desafio.models import Desafio

class DesafioFactoryTestCase(TestCase):
    def test_criacao_de_desafio_com_relacionamentos_corretos(self):
        factory = DesafioAtivoFactory()
        desafio = factory.criar_desafio()

        self.assertIsInstance(desafio, Desafio)
        self.assertEqual(desafio.titulo, "Desafio Backend Python")
        self.assertEqual(desafio.empresa.razao_social, "Tech Corp")
        self.assertEqual(desafio.nivel.nivel, "Avançado")
        self.assertEqual(desafio.status.status, "Aberto")
        
        # Verifica se foi realmente salvo no banco de dados
        self.assertTrue(Desafio.objects.filter(id=desafio.id).exists())