# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
import uuid

class Avaliacao(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nota = models.DecimalField(max_digits=10, decimal_places=2)
    feedback = models.TextField()
    data_avaliacao = models.DateTimeField()
    participacao = models.OneToOneField('Participacao', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'avaliacao'
        verbose_name = 'Avaliação'
        verbose_name_plural = 'Avaliações'
        
    def __str__(self):
        return f"Avaliação {self.id} - Nota: {self.nota}"


class Desafio(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    area = models.TextField()  # This field type is a guess.
    prazo = models.IntegerField()
    tecnologias = models.TextField()
    objetivo = models.TextField()
    requisitos = models.TextField()
    entregaveis = models.TextField()
    criterios_avaliativos = models.TextField()
    status = models.ForeignKey('Statusentrega', models.DO_NOTHING, db_column='status', blank=True, null=True)
    nivel = models.ForeignKey('Niveis', models.DO_NOTHING, db_column='nivel')
    empresa = models.ForeignKey('Empresa', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'desafio'
        verbose_name = 'Desafio'
        verbose_name_plural = 'Desafios'
        
    def __str__(self):
        return f"Desafio {self.titulo} - Empresa: {self.empresa.razao_social}"
class Empresa(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)    
    cnpj = models.CharField(max_length=14, unique=True)
    razao_social = models.CharField(max_length=100)
    descricao = models.TextField()
    contato = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'empresa'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        
    def __str__(self):
        return f"Empresa {self.razao_social}" 

class Interesseprofissional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)    
    mensagem = models.TextField()
    data_envio = models.DateTimeField(blank=True, null=True)
    status = models.ForeignKey('Statusentrega', models.DO_NOTHING, db_column='status')
    empresa = models.ForeignKey(Empresa, models.CASCADE)
    participacao = models.ForeignKey('Participacao', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'interesseprofissional'
        verbose_name = 'Interesse Profissional'
        verbose_name_plural = 'Interesses Profissionais'
        
    def __str__(self):
        return f"Interesse Profissional {self.id} - Empresa: {self.empresa.razao_social} - Participação: {self.participacao.id}"

class Listreconhecimento(models.Model):
    item = models.CharField(unique=True, max_length=33, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'listreconhecimento'
        verbose_name = 'Lista de Reconhecimento'
        verbose_name_plural = 'Listas de Reconhecimento'


class Niveis(models.Model):
    nivel = models.CharField(max_length=33)

    class Meta:
        managed = False
        db_table = 'niveis'
        verbose_name = 'Nível'
        verbose_name_plural = 'Níveis'

class Statusentrega(models.Model):
    status = models.CharField(max_length=33)

    class Meta:
        managed = False
        db_table = 'statusentrega'
        verbose_name = 'Status de Entrega'
        verbose_name_plural = 'Status de Entregas'


class Participacao(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    data_adesao = models.DateTimeField()
    status = models.ForeignKey('Statusentrega', models.DO_NOTHING, db_column='status')
    data_entrega = models.DateTimeField(blank=True, null=True)
    entrega_url = models.TextField(blank=True, null=True)
    estudante = models.ForeignKey('Perfilestudante', models.CASCADE)
    desafio = models.ForeignKey(Desafio, models.CASCADE)
    empresa = models.ForeignKey(Empresa, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'participacao'
        verbose_name = 'Participação'
        verbose_name_plural = 'Participações'
       
    def __str__(self):
        return f"Participação {self.id} - Estudante: {self.estudante.usuario.nome} - Desafio: {self.desafio.titulo} - Empresa: {self.empresa.razao_social}"


class Perfilestudante(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    curso = models.CharField(max_length=90)
    instituicao = models.CharField(max_length=90)
    biografia = models.TextField()
    competencias = models.CharField(max_length=255, blank=True, null=True)
    usuario = models.OneToOneField('Usuario', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'perfilestudante'
        verbose_name = 'Perfil Estudante'
        verbose_name_plural = 'Perfis Estudantes'

class Reconhecimento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    data_emissao = models.DateTimeField(blank=True, null=True)
    feedback = models.TextField()
    competencias = models.CharField(max_length=50, blank=True, null=True)
    participacao = models.ForeignKey(Participacao, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'reconhecimento'
        verbose_name = 'Reconhecimento'
        verbose_name_plural = 'Reconhecimentos'

class Usuario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=255)
    senha_hash = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuario'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'