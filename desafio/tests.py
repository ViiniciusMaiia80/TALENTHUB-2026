from django.test import TestCase
from django.utils import timezone
from desafio.models import (
    Empresa, 
    Desafio, 
    Participacao, 
    Avaliacao,
    Usuario,
    Perfilestudante
)

class EmpresaModelTest(TestCase):
    def setUp(self):
        self.empresa = Empresa.objects.create(
            razao_social="TechCorp Solutions",
            cnpj="12345678000199",
            descricao="Empresa de TI"
        )

    def test_criacao_empresa(self):
        self.assertEqual(self.empresa.razao_social, "TechCorp Solutions")
        self.assertEqual(self.empresa.cnpj, "12345678000199")

    def test_str_empresa(self):
        # Alinhado com: return f"Empresa {self.razao_social}"
        self.assertEqual(str(self.empresa), "Empresa TechCorp Solutions")


class DesafioModelTest(TestCase):
    def setUp(self):
        self.empresa = Empresa.objects.create(
            razao_social="Empresa Teste", 
            cnpj="98765432000111",
            descricao="Descrição Empresa"
        )
        self.desafio = Desafio.objects.create(
            titulo="Desafio de Desenvolvimento Web",
            descricao="Criar um portal usando DRF",
            area="Tecnologia",
            prazo=30,
            tecnologias="Python, Django",
            objetivo="Testar habilidades",
            requisitos="Conhecimento em Python",
            entregaveis="Repositório GitHub",
            criterios_avaliativos="Qualidade de código",
            status="ATIVO",
            nivel="PLENO",
            empresa=self.empresa
        )

    def test_criacao_desafio(self):
        self.assertEqual(self.desafio.titulo, "Desafio de Desenvolvimento Web")
        self.assertEqual(self.desafio.empresa, self.empresa)

    def test_str_desafio(self):
        # Alinhado com: return f"Desafio {self.titulo} - Empresa: {self.empresa.razao_social}"
        self.assertEqual(
            str(self.desafio), 
            "Desafio Desafio de Desenvolvimento Web - Empresa: Empresa Teste"
        )


class ParticipacaoModelTest(TestCase):
    def setUp(self):
        # Criando a cadeia de dependências do Usuário -> Estudante
        self.usuario = Usuario.objects.create(
            nome="Candidato Teste",
            email="candidato@teste.com",
            senha_hash="hash123"
        )
        self.estudante = Perfilestudante.objects.create(
            curso="Sistemas de Informação",
            instituicao="Universidade X",
            biografia="Estudante apaixonado por código",
            usuario=self.usuario
        )
        self.empresa = Empresa.objects.create(
            razao_social="Empresa Teste", 
            cnpj="11111111000111",
            descricao="Descrição"
        )
        self.desafio = Desafio.objects.create(
            titulo="Desafio Python", 
            descricao="Descrição", 
            area="TI",
            prazo=15,
            tecnologias="Python",
            objetivo="Aprender",
            requisitos="Lógica",
            entregaveis="Código",
            criterios_avaliativos="Testes",
            status="ABERTO",
            nivel="JUNIOR",
            empresa=self.empresa
        )
        
        self.participacao = Participacao.objects.create(
            data_adesao=timezone.now(),
            usuario=self.usuario,
            desafio=self.desafio,
            empresa=self.empresa
        )

    def test_criacao_participacao(self):
        self.assertEqual(self.participacao.usuario.nome, "Candidato Teste")
        self.assertEqual(self.participacao.desafio, self.desafio)


class AvaliacaoModelTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create(nome="Aluno 1", email="aluno1@teste.com")
        self.estudante = Perfilestudante.objects.create(
            curso="ADS", 
            instituicao="Faculdade Y", 
            biografia="Bio", 
            usuario=self.usuario.id
        )
        self.empresa = Empresa.objects.create(
            razao_social="Empresa X", 
            cnpj="22222222000122", 
            descricao="Desc"
        )
        self.desafio = Desafio.objects.create(
            titulo="Projeto X", 
            descricao="Desc", 
            area="Engenharia",
            prazo=10,
            tecnologias="Django",
            objetivo="Testar",
            requisitos="Nenhum",
            entregaveis="Zip",
            criterios_avaliativos="Funcionalidade",
            status="EM_ANDAMENTO",
            nivel="ESTAGIO",
            empresa=self.empresa
        )
        self.participacao = Participacao.objects.create(
            data_adesao=timezone.now(),
            usuario=self.usuario,
            desafio=self.desafio,
            empresa=self.empresa
        )
        
        self.avaliacao = Avaliacao.objects.create(
            participacao=self.participacao,
            nota=9.50,
            feedback="Excelente desempenho técnico no projeto.",
            data_avaliacao=timezone.now()
        )

    def test_criacao_avaliacao(self):
        self.assertEqual(float(self.avaliacao.nota), 9.50)
        self.assertEqual(self.avaliacao.participacao, self.participacao)