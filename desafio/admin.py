from django.contrib import admin
from .models import Avaliacao, Desafio, Empresa, Interesseprofissional, Participacao
# Register your models here.

@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin): 
    list_display = ('id', 'nota', 'feedback', 'data_avaliacao', 'participacao')

@admin.register(Desafio)
class DesafioAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'descricao', 'area', 'prazo', 'tecnologias', 'objetivo', 'requisitos', 'entregaveis', 'criterios_avaliativos', 'status', 'nivel', 'empresa')

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('id', 'razao_social', 'descricao', 'contato')

@admin.register(Interesseprofissional)
class InteresseprofissionalAdmin(admin.ModelAdmin):
    list_display = ('id', 'mensagem', 'data_envio', 'status', 'empresa', 'participacao')

@admin.register(Participacao)
class ParticipacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'data_adesao', 'status', 'data_entrega', 'entrega_url', 'estudante', 'desafio', 'empresa')