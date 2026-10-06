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
    status = models.CharField(max_length=20)
    nivel = models.CharField(max_length=33)
    empresa = models.ForeignKey('Empresa', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'desafio'

class Empresa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)    
    razao_social = models.CharField(max_length=100)
    descricao = models.TextField()
    contato = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'empresa'


class Interesseprofissional(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)    
    mensagem = models.TextField()
    data_envio = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=33)
    empresa = models.ForeignKey(Empresa, models.CASCADE)
    participacao = models.ForeignKey('Participacao', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'interesseprofissional'


class Participacao(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    data_adesao = models.DateTimeField()
    status = models.CharField(max_length=20, blank=True, null=True)
    data_entrega = models.DateTimeField(blank=True, null=True)
    entrega_url = models.TextField(blank=True, null=True)
    estudante = models.ForeignKey('Perfilestudante', models.CASCADE)
    desafio = models.ForeignKey(Desafio, models.CASCADE)
    empresa = models.ForeignKey(Empresa, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'participacao'


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


class Usuario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=255)
    senha_hash = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuario'
