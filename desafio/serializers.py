from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from desafio.models import (
    Avaliacao,
    Desafio,
    Empresa,
    Interesseprofissional,
    Niveis,
    Participacao,
    Perfilestudante,
    Reconhecimento,
    Statusentrega,
    Usuario,
)


class CommaSeparatedListField(serializers.Field):
    def to_representation(self, value):
        return [item.strip() for item in (value or '').split(',') if item.strip()]

    def to_internal_value(self, data):
        if isinstance(data, str):
            values = data.split(',')
        elif isinstance(data, list) and all(isinstance(item, str) for item in data):
            values = data
        else:
            raise serializers.ValidationError('Informe uma lista de textos.')
        normalized = [value.strip() for value in values if value.strip()]
        return ', '.join(normalized)


class EstudanteCadastroSerializer(serializers.Serializer):
    nome = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    curso = serializers.CharField(max_length=90)
    instituicao = serializers.CharField(max_length=90)
    area_interesse = serializers.CharField(max_length=120, required=False, allow_blank=True)
    competencias = CommaSeparatedListField(required=False, allow_null=True)

    def validate_senha(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value.lower()

    @transaction.atomic
    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password

        password = validated_data.pop('senha')
        competencias = validated_data.pop('competencias', '')
        usuario = Usuario.objects.create(
            nome=validated_data.pop('nome'),
            email=validated_data.pop('email'),
            senha_hash=make_password(password),
        )
        Perfilestudante.objects.create(
            usuario=usuario,
            competencias=competencias,
            **validated_data,
        )
        return usuario


class EmpresaCadastroSerializer(serializers.Serializer):
    razao_social = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    area_atuacao = serializers.CharField(max_length=120)
    descricao = serializers.CharField()
    cnpj = serializers.RegexField(r'^\d{14}$', required=False, allow_null=True)

    def validate_senha(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value.lower()

    def validate_cnpj(self, value):
        if value and Empresa.objects.filter(cnpj=value).exists():
            raise serializers.ValidationError('Este CNPJ já está cadastrado.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password

        password = validated_data.pop('senha')
        email = validated_data.pop('email')
        usuario = Usuario.objects.create(
            nome=validated_data['razao_social'],
            email=email,
            senha_hash=make_password(password),
        )
        Empresa.objects.create(usuario=usuario, contato=email, **validated_data)
        return usuario


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True, trim_whitespace=False)


class ConviteSerializer(serializers.Serializer):
    mensagem = serializers.CharField()

    def validate_mensagem(self, value):
        if not value.strip():
            raise serializers.ValidationError('Informe a mensagem do convite.')
        return value.strip()


class RespostaOportunidadeSerializer(serializers.Serializer):
    resposta = serializers.ChoiceField(choices=('Aceito', 'Recusado'))


class UsuarioSerializer(serializers.ModelSerializer):
    tipo_perfil = serializers.SerializerMethodField()
    perfil = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ('id', 'nome', 'email', 'tipo_perfil', 'perfil')

    def get_tipo_perfil(self, obj):
        if hasattr(obj, 'perfilestudante'):
            return 'estudante'
        if hasattr(obj, 'empresa'):
            return 'empresa'
        return None

    def get_perfil(self, obj):
        if hasattr(obj, 'perfilestudante'):
            perfil = obj.perfilestudante
            return {
                'curso': perfil.curso,
                'instituicao': perfil.instituicao,
                'biografia': perfil.biografia,
                'area_interesse': perfil.area_interesse,
                'competencias': CommaSeparatedListField().to_representation(
                    perfil.competencias
                ),
            }
        if hasattr(obj, 'empresa'):
            empresa = obj.empresa
            return {
                'razao_social': empresa.razao_social,
                'descricao': empresa.descricao,
                'area_atuacao': empresa.area_atuacao,
                'cnpj': empresa.cnpj,
            }
        return None


class PerfilEstudanteSerializer(serializers.ModelSerializer):
    competencias = CommaSeparatedListField(required=False, allow_null=True)

    class Meta:
        model = Perfilestudante
        fields = ('id', 'curso', 'instituicao', 'biografia', 'area_interesse', 'competencias')
        read_only_fields = ('id',)


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ('id', 'cnpj', 'razao_social', 'descricao', 'contato', 'area_atuacao')
        read_only_fields = ('id', 'contato')


class DesafioSerializer(serializers.ModelSerializer):
    tecnologias = CommaSeparatedListField()
    nivel = serializers.CharField()
    empresa = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.status', read_only=True)

    class Meta:
        model = Desafio
        fields = (
            'id',
            'titulo',
            'descricao',
            'area',
            'prazo',
            'tecnologias',
            'objetivo',
            'requisitos',
            'entregaveis',
            'criterios_avaliativos',
            'status',
            'nivel',
            'empresa',
        )
        read_only_fields = ('id', 'status', 'empresa')

    def get_empresa(self, obj):
        return {
            'id': str(obj.empresa_id),
            'razao_social': obj.empresa.razao_social,
            'area_atuacao': obj.empresa.area_atuacao,
        }

    def create(self, validated_data):
        nivel_nome = validated_data.pop('nivel').strip()
        if not nivel_nome:
            raise serializers.ValidationError({'nivel': 'Informe o nível do desafio.'})
        nivel, _ = Niveis.objects.get_or_create(nivel=nivel_nome)
        status, _ = Statusentrega.objects.get_or_create(status='Aberto')
        return Desafio.objects.create(
            nivel=nivel,
            status=status,
            empresa=self.context['request'].user.empresa,
            **validated_data,
        )

    def update(self, instance, validated_data):
        if 'nivel' in validated_data:
            nivel_nome = validated_data.pop('nivel').strip()
            if not nivel_nome:
                raise serializers.ValidationError(
                    {'nivel': 'Informe o nível do desafio.'}
                )
            instance.nivel, _ = Niveis.objects.get_or_create(nivel=nivel_nome)
        return super().update(instance, validated_data)


class EmpresaResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ('id', 'razao_social', 'area_atuacao')


class DesafioResumoSerializer(serializers.ModelSerializer):
    empresa = EmpresaResumoSerializer(read_only=True)
    nivel = serializers.CharField(source='nivel.nivel', read_only=True)

    class Meta:
        model = Desafio
        fields = ('id', 'titulo', 'area', 'prazo', 'nivel', 'empresa')


class ParticipacaoSerializer(serializers.ModelSerializer):
    desafio = DesafioResumoSerializer(read_only=True)
    status = serializers.CharField(source='status.status', read_only=True)
    estudante = serializers.SerializerMethodField()
    avaliacao = serializers.SerializerMethodField()

    class Meta:
        model = Participacao
        fields = (
            'id',
            'data_adesao',
            'status',
            'data_entrega',
            'entrega_url',
            'estudante',
            'desafio',
            'avaliacao',
        )
        read_only_fields = fields

    def get_estudante(self, obj):
        perfil = obj.estudante
        return {
            'id': str(perfil.id),
            'nome': perfil.usuario.nome,
            'curso': perfil.curso,
            'instituicao': perfil.instituicao,
            'competencias': CommaSeparatedListField().to_representation(
                perfil.competencias
            ),
        }

    def get_avaliacao(self, obj):
        try:
            avaliacao = obj.avaliacao
        except Avaliacao.DoesNotExist:
            return None
        return {
            'nota': str(avaliacao.nota),
            'feedback': avaliacao.feedback,
            'data_avaliacao': avaliacao.data_avaliacao,
        }


class AvaliarParticipacaoSerializer(serializers.Serializer):
    nota = serializers.DecimalField(max_digits=4, decimal_places=2, min_value=0, max_value=10)
    feedback = serializers.CharField()
    reconhecimento_tipo = serializers.CharField(max_length=50, required=False)
    competencias = CommaSeparatedListField(required=False, allow_null=True)

    def validate_competencias(self, value):
        if value and len(value) > 50:
            raise serializers.ValidationError(
                'As competências do reconhecimento devem ter até 50 caracteres.'
            )
        return value


class InteresseSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='status.status', read_only=True)
    empresa = EmpresaResumoSerializer(read_only=True)
    participacao = serializers.UUIDField(source='participacao_id', read_only=True)
    oportunidade = serializers.CharField(source='mensagem', read_only=True)

    class Meta:
        model = Interesseprofissional
        fields = (
            'id',
            'oportunidade',
            'mensagem',
            'data_envio',
            'status',
            'empresa',
            'participacao',
        )
        read_only_fields = fields


class ReconhecimentoSerializer(serializers.ModelSerializer):
    desafio = serializers.CharField(source='participacao.desafio.titulo', read_only=True)
    empresa = serializers.CharField(source='participacao.empresa.razao_social', read_only=True)
    competencias = CommaSeparatedListField(read_only=True)

    class Meta:
        model = Reconhecimento
        fields = ('id', 'tipo', 'data_emissao', 'feedback', 'competencias', 'desafio', 'empresa')
