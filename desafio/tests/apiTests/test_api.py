from rest_framework.test import APITestCase

from desafio.models import (
    Avaliacao,
    Interesseprofissional,
    Reconhecimento,
    Usuario,
)


class TalentHubApiTestCase(APITestCase):
    password = 'Projeto@2026Forte'

    def cadastrar_estudante(self, email='estudante@example.com'):
        response = self.client.post(
            '/api/auth/register/student/',
            {
                'nome': 'Ana Silva',
                'email': email,
                'senha': self.password,
                'curso': 'Análise e Desenvolvimento de Sistemas',
                'instituicao': 'Universidade Teste',
                'area_interesse': 'Dados',
                'competencias': ['Python', 'SQL'],
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data['token']

    def cadastrar_empresa(self, email='empresa@example.com'):
        response = self.client.post(
            '/api/auth/register/company/',
            {
                'razao_social': 'Tech Teste',
                'email': email,
                'senha': self.password,
                'area_atuacao': 'Tecnologia',
                'descricao': 'Empresa para testes.',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data['token']

    def publicar_desafio(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post(
            '/api/challenges/',
            {
                'titulo': 'Dashboard de vendas',
                'descricao': 'Criar um dashboard de indicadores.',
                'area': 'Dados',
                'prazo': 7,
                'tecnologias': ['Python', 'SQL'],
                'objetivo': 'Analisar vendas.',
                'requisitos': 'Documentar as decisões.',
                'entregaveis': 'Projeto e documentação.',
                'criterios_avaliativos': 'Clareza e qualidade.',
                'nivel': 'Intermediário',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data['id']

    def test_student_can_register_and_login_with_hashed_password(self):
        token = self.cadastrar_estudante()
        self.client.credentials()

        response = self.client.post(
            '/api/auth/login/',
            {'email': 'ESTUDANTE@example.com', 'senha': self.password},
            format='json',
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertNotEqual(response.data['token'], token)
        self.assertEqual(response.data['usuario']['tipo_perfil'], 'estudante')
        self.assertEqual(response.data['usuario']['perfil']['competencias'], ['Python', 'SQL'])
        self.assertNotEqual(
            Usuario.objects.get(email='estudante@example.com').senha_hash,
            self.password,
        )

    def test_complete_student_company_challenge_workflow(self):
        company_token = self.cadastrar_empresa()
        challenge_id = self.publicar_desafio(company_token)

        listing = self.client.get('/api/challenges/?area=Dados&tecnologia=Python')
        self.assertEqual(listing.status_code, 200, listing.data)
        self.assertEqual(len(listing.data), 1)
        self.assertEqual(listing.data[0]['status'], 'Aberto')

        student_token = self.cadastrar_estudante()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_token}')
        enrollment = self.client.post(
            f'/api/challenges/{challenge_id}/participate/',
            {},
            format='json',
        )
        self.assertEqual(enrollment.status_code, 201, enrollment.data)
        participation_id = enrollment.data['id']

        duplicate = self.client.post(
            f'/api/challenges/{challenge_id}/participate/',
            {},
            format='json',
        )
        self.assertEqual(duplicate.status_code, 400)

        submission = self.client.post(
            f'/api/participations/{participation_id}/submit/',
            {'entrega_url': 'https://github.com/aluno/dashboard'},
            format='json',
        )
        self.assertEqual(submission.status_code, 200, submission.data)
        self.assertEqual(submission.data['status'], 'Submetido')

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {company_token}')
        evaluation = self.client.post(
            f'/api/participations/{participation_id}/evaluate/',
            {
                'nota': '9.50',
                'feedback': 'Boa análise e documentação.',
                'reconhecimento_tipo': 'Badge',
                'competencias': ['Python', 'Análise de dados'],
            },
            format='json',
        )
        self.assertEqual(evaluation.status_code, 200, evaluation.data)
        self.assertEqual(evaluation.data['status'], 'Avaliado')
        self.assertTrue(Avaliacao.objects.filter(participacao_id=participation_id).exists())
        self.assertTrue(Reconhecimento.objects.filter(participacao_id=participation_id).exists())

        company_dashboard = self.client.get('/api/dashboard/')
        self.assertEqual(company_dashboard.status_code, 200, company_dashboard.data)
        self.assertEqual(
            company_dashboard.data['indicadores']['entregas_recebidas'],
            1,
        )
        self.assertEqual(
            company_dashboard.data['indicadores']['avaliacoes_pendentes'],
            0,
        )

        invitation = self.client.post(
            f'/api/participations/{participation_id}/interest/',
            {'mensagem': 'Gostaríamos de conversar sobre uma vaga de estágio.'},
            format='json',
        )
        self.assertEqual(invitation.status_code, 201, invitation.data)
        self.assertEqual(invitation.data['status'], 'Novo convite')
        invitation_id = invitation.data['id']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_token}')
        response = self.client.post(
            f'/api/opportunities/{invitation_id}/respond/',
            {'resposta': 'Aceito'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['status'], 'Aceito')
        self.assertEqual(Interesseprofissional.objects.count(), 1)
        student_dashboard = self.client.get('/api/dashboard/')
        self.assertEqual(student_dashboard.status_code, 200, student_dashboard.data)
        self.assertEqual(
            student_dashboard.data['indicadores']['desafios_concluidos'],
            1,
        )
        self.assertEqual(student_dashboard.data['indicadores']['badges'], 1)
        self.assertEqual(student_dashboard.data['indicadores']['oportunidades'], 1)

    def test_company_cannot_evaluate_another_companys_participation(self):
        original_company = self.cadastrar_empresa()
        challenge_id = self.publicar_desafio(original_company)
        student_token = self.cadastrar_estudante()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_token}')
        enrollment = self.client.post(
            f'/api/challenges/{challenge_id}/participate/',
            {},
            format='json',
        )
        self.assertEqual(enrollment.status_code, 201, enrollment.data)
        participation_id = enrollment.data['id']

        other_company = self.cadastrar_empresa('outra-empresa@example.com')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {other_company}')
        response = self.client.post(
            f'/api/participations/{participation_id}/evaluate/',
            {'nota': '8.00', 'feedback': 'Avaliação não autorizada.'},
            format='json',
        )
        self.assertEqual(response.status_code, 404)
