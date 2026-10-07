from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone

from desafio.models import Participacao, Statusentrega, Empresa, Desafio, Usuario, Perfilestudante, Niveis, Avaliacao
from desafio.domain.state import ParticipacaoContext, InscritoState, SubmetidoState, AvaliadoState


class ParticipacaoStateTestCase(TestCase):
    def setUp(self):
        # 1. Criação da massa de dados inicial
        self.status_inscrito = Statusentrega.objects.create(status="Inscrito")
        self.status_submetido = Statusentrega.objects.create(status="Submetido")
        self.status_avaliado = Statusentrega.objects.create(status="Avaliado")
        
        self.nivel = Niveis.objects.create(nivel="Avançado")
        self.empresa = Empresa.objects.create(cnpj="12345678000199", razao_social="Empresa Teste")
        self.usuario = Usuario.objects.create(nome="Dev Teste", email="dev@teste.com")
        self.estudante = Perfilestudante.objects.create(
            curso="Sistemas", 
            instituicao="FAMETRO", 
            biografia="Estudante de ADS", 
            usuario=self.usuario
        )
        
        self.desafio = Desafio.objects.create(
            titulo="Desafio Backend", descricao="...", area="TI", prazo=10, 
            tecnologias="Python", objetivo="...", requisitos="...", entregaveis="...", 
            criterios_avaliativos="...", nivel=self.nivel, empresa=self.empresa
        )
        
        self.participacao = Participacao.objects.create(
            data_adesao=timezone.now(),
            status=self.status_inscrito,
            estudante=self.estudante,
            desafio=self.desafio,
            empresa=self.empresa
        )

    def test_estado_inicial_deve_ser_inscrito(self):
        contexto = ParticipacaoContext(self.participacao)
        self.assertIsInstance(contexto._state, InscritoState)

    def test_transicao_inscrito_para_submetido_com_sucesso(self):
        contexto = ParticipacaoContext(self.participacao)
        url_repo = "https://github.com/exemplo/projeto"
        
        contexto.enviar_entrega(url_repo)
        
        # Atualiza a instância com os dados salvos no banco
        self.participacao.refresh_from_db()
        self.assertEqual(self.participacao.status.status, "Submetido")
        self.assertEqual(self.participacao.entrega_url, url_repo)
        self.assertIsNotNone(self.participacao.data_entrega)
        self.assertIsInstance(contexto._state, SubmetidoState)

    def test_nao_deve_permitir_avaliacao_em_estado_inscrito(self):
        contexto = ParticipacaoContext(self.participacao)
        
        with self.assertRaises(ValidationError):
            contexto.avaliar(nota=10.0, feedback="Excelente")

    def test_transicao_submetido_para_avaliado_com_sucesso(self):
        # Avança para o estado 'Submetido'
        contexto = ParticipacaoContext(self.participacao)
        contexto.enviar_entrega("https://github.com/exemplo/projeto")
        
        # Realiza a avaliação
        contexto.avaliar(nota=9.5, feedback="Excelente código!")
        
        self.participacao.refresh_from_db()
        self.assertEqual(self.participacao.status.status, "Avaliado")
        self.assertIsInstance(contexto._state, AvaliadoState)
        
        # Verifica se o registro de Avaliacao foi de fato persistido
        avaliacao = Avaliacao.objects.get(participacao=self.participacao)
        self.assertEqual(float(avaliacao.nota), 9.5)
        self.assertEqual(avaliacao.feedback, "Excelente código!")

    def test_nao_deve_permitir_reenvio_de_entrega_apos_submissao(self):
        contexto = ParticipacaoContext(self.participacao)
        contexto.enviar_entrega("https://github.com/exemplo/projeto")
        
        with self.assertRaises(ValidationError):
            contexto.enviar_entrega("https://github.com/exemplo/novo-projeto")

    def test_nao_deve_permitir_acoes_apos_estado_avaliado(self):
        contexto = ParticipacaoContext(self.participacao)
        contexto.enviar_entrega("https://github.com/exemplo/projeto")
        contexto.avaliar(nota=8.0, feedback="Aprovado")
        
        # Tentativa de reenvio
        with self.assertRaises(ValidationError):
            contexto.enviar_entrega("https://github.com/exemplo/outro")
            
        # Tentativa de reavaliação
        with self.assertRaises(ValidationError):
            contexto.avaliar(nota=10.0, feedback="Mudança de nota")

    def test_mapeamento_dinamico_de_estado_ao_recarregar_do_banco(self):
        # Altera o status direto na model para simular a leitura de um registro já existente no BD
        self.participacao.status = self.status_submetido
        self.participacao.save()
        
        contexto = ParticipacaoContext(self.participacao)
        self.assertIsInstance(contexto._state, SubmetidoState)