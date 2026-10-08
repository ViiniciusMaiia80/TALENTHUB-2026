import hashlib
import secrets
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from desafio.domain.state import ParticipacaoContext
from desafio.models import (
    Avaliacao,
    Desafio,
    Empresa,
    Interesseprofissional,
    Participacao,
    Perfilestudante,
    Reconhecimento,
    Statusentrega,
    TokenAutenticacao,
    Usuario,
)
from desafio.serializers import (
    AvaliarParticipacaoSerializer,
    DesafioSerializer,
    EmpresaCadastroSerializer,
    EmpresaSerializer,
    EstudanteCadastroSerializer,
    InteresseSerializer,
    ParticipacaoSerializer,
    PerfilEstudanteSerializer,
    ReconhecimentoSerializer,
    LoginSerializer,
    ConviteSerializer,
    RespostaOportunidadeSerializer,
    UsuarioSerializer,
)


def criar_token(usuario):
    chave = secrets.token_urlsafe(32)
    TokenAutenticacao.objects.create(
        usuario=usuario,
        chave_hash=hashlib.sha256(chave.encode()).hexdigest(),
    )
    return chave


def estudante_do_usuario(usuario):
    try:
        return usuario.perfilestudante
    except Perfilestudante.DoesNotExist as error:
        raise PermissionDenied('Esta ação é exclusiva para estudantes.') from error


def empresa_do_usuario(usuario):
    try:
        return usuario.empresa
    except Empresa.DoesNotExist as error:
        raise PermissionDenied('Esta ação é exclusiva para empresas.') from error


def status_por_nome(nome):
    return Statusentrega.objects.get_or_create(status=nome)[0]


def api_error_message(error):
    messages = getattr(error, 'messages', None)
    return str(messages[0] if messages else error)


class CadastroEstudanteView(APIView):
    permission_classes = (AllowAny,)

    @transaction.atomic
    def post(self, request):
        serializer = EstudanteCadastroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        token = criar_token(usuario)
        return Response(
            {'token': token, 'usuario': UsuarioSerializer(usuario).data},
            status=status.HTTP_201_CREATED,
        )


class CadastroEmpresaView(APIView):
    permission_classes = (AllowAny,)

    @transaction.atomic
    def post(self, request):
        serializer = EmpresaCadastroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        token = criar_token(usuario)
        return Response(
            {'token': token, 'usuario': UsuarioSerializer(usuario).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        senha = serializer.validated_data['senha']
        try:
            usuario = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist as error:
            raise AuthenticationFailed('E-mail ou senha inválidos.') from error
        if not usuario.senha_hash or not check_password(senha, usuario.senha_hash):
            raise AuthenticationFailed('E-mail ou senha inválidos.')
        token = criar_token(usuario)
        return Response({'token': token, 'usuario': UsuarioSerializer(usuario).data})


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MinhaContaView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)


class MeuPerfilView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            perfil = request.user.perfilestudante
            return Response(PerfilEstudanteSerializer(perfil).data)
        except Perfilestudante.DoesNotExist:
            pass
        try:
            empresa = request.user.empresa
        except Empresa.DoesNotExist as error:
            raise NotFound('Perfil não encontrado.') from error
        return Response(EmpresaSerializer(empresa).data)

    def patch(self, request):
        empresa_profile = False
        try:
            perfil = request.user.perfilestudante
        except Perfilestudante.DoesNotExist:
            try:
                empresa = request.user.empresa
            except Empresa.DoesNotExist as error:
                raise NotFound('Perfil não encontrado.') from error
            serializer = EmpresaSerializer(empresa, data=request.data, partial=True)
            empresa_profile = True
        else:
            serializer = PerfilEstudanteSerializer(perfil, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        perfil = serializer.save()
        if empresa_profile and 'razao_social' in serializer.validated_data:
            request.user.nome = perfil.razao_social
            request.user.save(update_fields=('nome',))
        return Response(serializer.data)


class DesafiosView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        desafios = Desafio.objects.select_related('empresa', 'nivel', 'status').filter(
            status__status__in=('Aberto', 'Em andamento')
        )
        query = request.query_params.get('q')
        if query:
            desafios = desafios.filter(
                Q(titulo__icontains=query)
                | Q(descricao__icontains=query)
                | Q(tecnologias__icontains=query)
                | Q(area__icontains=query)
                | Q(empresa__razao_social__icontains=query)
            )
        for parameter, field in (
            ('area', 'area__icontains'),
            ('nivel', 'nivel__nivel__iexact'),
            ('tecnologia', 'tecnologias__icontains'),
            ('empresa', 'empresa__razao_social__icontains'),
        ):
            value = request.query_params.get(parameter)
            if value:
                desafios = desafios.filter(**{field: value})
        prazo = request.query_params.get('prazo')
        if prazo:
            try:
                dias = int(prazo)
            except ValueError as error:
                raise ValidationError({'prazo': 'Informe o prazo em dias.'}) from error
            desafios = desafios.filter(prazo=dias)
        return Response(DesafioSerializer(desafios, many=True).data)

    def post(self, request):
        empresa_do_usuario(request.user)
        serializer = DesafioSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        desafio = serializer.save()
        return Response(
            DesafioSerializer(desafio).data,
            status=status.HTTP_201_CREATED,
        )


class DesafioDetalheView(APIView):
    def get_permissions(self):
        if self.request.method in ('PATCH', 'DELETE'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_object(self, pk):
        try:
            return Desafio.objects.select_related(
                'empresa', 'nivel', 'status'
            ).get(pk=pk)
        except Desafio.DoesNotExist as error:
            raise NotFound('Desafio não encontrado.') from error

    def get(self, request, pk):
        return Response(DesafioSerializer(self.get_object(pk)).data)

    def patch(self, request, pk):
        desafio = self.get_object(pk)
        empresa = empresa_do_usuario(request.user)
        if desafio.empresa_id != empresa.id:
            raise PermissionDenied('Você só pode editar desafios da sua empresa.')
        serializer = DesafioSerializer(
            desafio,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        desafio = self.get_object(pk)
        empresa = empresa_do_usuario(request.user)
        if desafio.empresa_id != empresa.id:
            raise PermissionDenied('Você só pode remover desafios da sua empresa.')
        desafio.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ParticiparDesafioView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        estudante = estudante_do_usuario(request.user)
        try:
            desafio = Desafio.objects.select_related('empresa', 'status').get(pk=pk)
        except Desafio.DoesNotExist as error:
            raise NotFound('Desafio não encontrado.') from error
        if not desafio.status or desafio.status.status not in ('Aberto', 'Em andamento'):
            raise ValidationError({'detail': 'Este desafio não está aceitando participações.'})
        participacao, created = Participacao.objects.get_or_create(
            estudante=estudante,
            desafio=desafio,
            defaults={
                'empresa': desafio.empresa,
                'status': status_por_nome('Inscrito'),
            },
        )
        if not created:
            raise ValidationError({'detail': 'Você já participa deste desafio.'})
        return Response(
            ParticipacaoSerializer(participacao).data,
            status=status.HTTP_201_CREATED,
        )


class ParticipacoesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if hasattr(request.user, 'perfilestudante'):
            participacoes = Participacao.objects.filter(
                estudante=request.user.perfilestudante
            )
        elif hasattr(request.user, 'empresa'):
            participacoes = Participacao.objects.filter(empresa=request.user.empresa)
        else:
            raise PermissionDenied('A conta não possui um perfil ativo.')
        participacoes = participacoes.select_related(
            'estudante__usuario', 'desafio__empresa', 'desafio__nivel', 'status'
        ).order_by('-data_adesao')
        return Response(ParticipacaoSerializer(participacoes, many=True).data)


class EnviarEntregaView(APIView):
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request, pk):
        estudante = estudante_do_usuario(request.user)
        url = request.data.get('entrega_url')
        if not isinstance(url, str) or not url.strip():
            raise ValidationError({'entrega_url': 'Informe o link da solução enviada.'})
        if len(url) > 10000:
            raise ValidationError({'entrega_url': 'O link informado é muito longo.'})
        try:
            URLValidator(schemes=('http', 'https'))(url.strip())
        except DjangoValidationError as error:
            raise ValidationError(
                {'entrega_url': 'Informe um link http ou https válido.'}
            ) from error
        try:
            participacao = Participacao.objects.select_for_update().select_related('status').get(
                pk=pk,
                estudante=estudante,
            )
        except Participacao.DoesNotExist as error:
            raise NotFound('Participação não encontrada.') from error
        try:
            ParticipacaoContext(participacao).enviar_entrega(url.strip())
        except DjangoValidationError as error:
            raise ValidationError({'detail': api_error_message(error)}) from error
        participacao.refresh_from_db()
        return Response(ParticipacaoSerializer(participacao).data)


class AvaliarEntregaView(APIView):
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request, pk):
        empresa = empresa_do_usuario(request.user)
        try:
            participacao = Participacao.objects.select_for_update().select_related(
                'status', 'estudante__usuario', 'desafio__empresa', 'desafio__nivel'
            ).get(pk=pk, empresa=empresa)
        except Participacao.DoesNotExist as error:
            raise NotFound('Entrega não encontrada.') from error
        if not participacao.data_entrega:
            raise ValidationError({'detail': 'A participação ainda não possui entrega.'})
        serializer = AvaliarParticipacaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            ParticipacaoContext(participacao).avaliar(
                nota=data['nota'],
                feedback=data['feedback'],
            )
        except DjangoValidationError as error:
            raise ValidationError({'detail': api_error_message(error)}) from error
        tipo = data.get('reconhecimento_tipo')
        if tipo:
            Reconhecimento.objects.create(
                tipo=tipo,
                data_emissao=timezone.now(),
                feedback=data['feedback'],
                competencias=data.get('competencias', ''),
                participacao=participacao,
            )
        participacao.refresh_from_db()
        return Response(ParticipacaoSerializer(participacao).data)


class ReconhecimentosView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        estudante = estudante_do_usuario(request.user)
        reconhecimentos = Reconhecimento.objects.filter(
            participacao__estudante=estudante
        ).select_related('participacao__desafio', 'participacao__empresa')
        return Response(ReconhecimentoSerializer(reconhecimentos, many=True).data)


class OportunidadesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if hasattr(request.user, 'perfilestudante'):
            oportunidades = Interesseprofissional.objects.filter(
                participacao__estudante=request.user.perfilestudante
            )
        elif hasattr(request.user, 'empresa'):
            oportunidades = Interesseprofissional.objects.filter(empresa=request.user.empresa)
        else:
            raise PermissionDenied('A conta não possui um perfil ativo.')
        oportunidades = oportunidades.select_related('empresa', 'participacao').order_by(
            '-data_envio'
        )
        return Response(InteresseSerializer(oportunidades, many=True).data)


class DemonstrarInteresseView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        empresa = empresa_do_usuario(request.user)
        try:
            participacao = Participacao.objects.get(pk=pk, empresa=empresa)
        except Participacao.DoesNotExist as error:
            raise NotFound('Participação não encontrada nos desafios da sua empresa.') from error
        if not Avaliacao.objects.filter(participacao=participacao).exists():
            raise ValidationError(
                {'detail': 'Avalie a entrega antes de enviar um convite profissional.'}
            )
        serializer = ConviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        oportunidade, created = Interesseprofissional.objects.get_or_create(
            empresa=empresa,
            participacao=participacao,
            defaults={
                'mensagem': serializer.validated_data['mensagem'],
                'data_envio': timezone.now(),
                'status': status_por_nome('Novo convite'),
            },
        )
        if not created:
            raise ValidationError({'detail': 'Já existe um convite para esta participação.'})
        return Response(
            InteresseSerializer(oportunidade).data,
            status=status.HTTP_201_CREATED,
        )


class ResponderOportunidadeView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        estudante = estudante_do_usuario(request.user)
        serializer = RespostaOportunidadeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resposta = serializer.validated_data['resposta']
        try:
            oportunidade = Interesseprofissional.objects.get(
                pk=pk,
                participacao__estudante=estudante,
            )
        except Interesseprofissional.DoesNotExist as error:
            raise NotFound('Oportunidade não encontrada.') from error
        if oportunidade.status.status != 'Novo convite':
            raise ValidationError({'detail': 'Este convite já foi respondido.'})
        oportunidade.status = status_por_nome(resposta)
        oportunidade.save(update_fields=('status',))
        return Response(InteresseSerializer(oportunidade).data)


class DashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if hasattr(request.user, 'perfilestudante'):
            return self.dashboard_estudante(request.user.perfilestudante)
        if hasattr(request.user, 'empresa'):
            return self.dashboard_empresa(request.user.empresa)
        raise PermissionDenied('A conta não possui um perfil ativo.')

    def dashboard_estudante(self, estudante):
        participacoes = Participacao.objects.filter(estudante=estudante)
        reconhecimentos = Reconhecimento.objects.filter(participacao__estudante=estudante)
        oportunidades = Interesseprofissional.objects.filter(
            participacao__estudante=estudante
        ).count()
        desafios_concluidos = participacoes.filter(status__status='Avaliado').count()
        desafios_em_andamento = participacoes.filter(
            status__status__in=('Inscrito', 'Submetido')
        ).count()
        competencias = [
            item.strip()
            for item in (estudante.competencias or '').split(',')
            if item.strip()
        ]
        recomendados = Desafio.objects.select_related(
            'empresa', 'nivel', 'status'
        ).filter(
            status__status__in=('Aberto', 'Em andamento')
        )
        if estudante.area_interesse:
            recomendados = recomendados.filter(area__icontains=estudante.area_interesse)
        if competencias:
            technology_filter = Q()
            for competencia in competencias:
                technology_filter |= Q(tecnologias__icontains=competencia)
            recomendados = recomendados.filter(technology_filter)
        return Response(
            {
                'indicadores': {
                    'desafios_concluidos': desafios_concluidos,
                    'desafios_em_andamento': desafios_em_andamento,
                    'badges': reconhecimentos.filter(tipo__icontains='badge').count(),
                    'certificados': reconhecimentos.filter(
                        tipo__icontains='certificado'
                    ).count(),
                    'oportunidades': oportunidades,
                },
                'participacoes': ParticipacaoSerializer(
                    participacoes.select_related(
                        'estudante__usuario',
                        'desafio__empresa',
                        'desafio__nivel',
                        'status',
                    ).order_by('-data_adesao')[:5],
                    many=True,
                ).data,
                'desafios_recomendados': DesafioSerializer(
                    recomendados[:6],
                    many=True,
                ).data,
            }
        )

    def dashboard_empresa(self, empresa):
        desafios = Desafio.objects.filter(empresa=empresa)
        participacoes = Participacao.objects.filter(empresa=empresa)
        pendentes = participacoes.filter(status__status='Submetido')
        return Response(
            {
                'indicadores': {
                    'desafios_publicados': desafios.count(),
                    'participacoes': participacoes.count(),
                    'entregas_recebidas': participacoes.filter(
                        data_entrega__isnull=False
                    ).count(),
                    'avaliacoes_pendentes': pendentes.count(),
                    'talentos_identificados': Interesseprofissional.objects.filter(
                        empresa=empresa
                    ).values('participacao__estudante').distinct().count(),
                },
                'entregas_pendentes': ParticipacaoSerializer(
                    pendentes.select_related(
                        'estudante__usuario',
                        'desafio__empresa',
                        'desafio__nivel',
                        'status',
                    ).order_by('data_entrega')[:10],
                    many=True,
                ).data,
                'desafios': DesafioSerializer(
                    desafios.select_related('empresa', 'nivel', 'status').order_by(
                        '-id'
                    )[:10],
                    many=True,
                ).data,
            }
        )
