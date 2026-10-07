import hashlib

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from desafio.models import TokenAutenticacao


class BearerTokenAuthentication(BaseAuthentication):
    keyword = b'bearer'

    def authenticate(self, request):
        parts = get_authorization_header(request).split()
        if not parts:
            return None
        if len(parts) != 2 or parts[0].lower() != self.keyword:
            raise AuthenticationFailed('Use o cabeçalho Authorization: Bearer <token>.')

        token_hash = hashlib.sha256(parts[1]).hexdigest()
        try:
            token = TokenAutenticacao.objects.select_related('usuario').get(
                chave_hash=token_hash
            )
        except TokenAutenticacao.DoesNotExist as error:
            raise AuthenticationFailed('Token inválido ou expirado.') from error
        return token.usuario, token

    def authenticate_header(self, request):
        return 'Bearer'
