import copy
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


def ensure_current_schema(apps, schema_editor):
    connection = schema_editor.connection
    database = connection.alias
    model_names = (
        'Usuario',
        'Empresa',
        'Niveis',
        'Statusentrega',
        'Perfilestudante',
        'Desafio',
        'Participacao',
        'Avaliacao',
        'Reconhecimento',
        'Interesseprofissional',
        'Listreconhecimento',
        'TokenAutenticacao',
    )
    domain_models = tuple(
        apps.get_model('desafio', model_name) for model_name in model_names
    )
    existing_tables = set(connection.introspection.table_names())

    for model in domain_models:
        table = model._meta.db_table
        if table not in existing_tables:
            schema_editor.create_model(model)
            existing_tables.add(table)
            continue

        with connection.cursor() as cursor:
            columns = {
                column.name: column
                for column in connection.introspection.get_table_description(cursor, table)
            }
        for field in model._meta.local_fields:
            if field.column not in columns:
                schema_editor.add_field(model, field)
            elif field.name == 'cnpj' and field.null and not columns[field.column].null_ok:
                required_field = copy.copy(field)
                required_field.null = False
                schema_editor.alter_field(
                    model,
                    required_field,
                    field,
                    strict=False,
                )

    legacy_relations = (
        ('Desafio', 'status', 'Statusentrega', 'status', 20, False),
        ('Desafio', 'nivel', 'Niveis', 'nivel', 33, False),
        ('Participacao', 'status', 'Statusentrega', 'status', 20, True),
        ('Interesseprofissional', 'status', 'Statusentrega', 'status', 33, False),
    )
    for model_name, field_name, related_name, lookup_field, max_length, nullable in legacy_relations:
        model = apps.get_model('desafio', model_name)
        field = model._meta.get_field(field_name)
        table = model._meta.db_table
        with connection.cursor() as cursor:
            column = next(
                column
                for column in connection.introspection.get_table_description(cursor, table)
                if column.name == field.column
            )
        column_type = connection.introspection.get_field_type(
            column.type_code,
            column,
        ).lower()
        if 'char' not in column_type and 'text' not in column_type:
            continue

        related_model = apps.get_model('desafio', related_name)
        related_lookup = related_model.objects.using(database)
        if model_name == 'Participacao':
            related_lookup.get_or_create(status='Inscrito')
        quoted_table = connection.ops.quote_name(table)
        quoted_column = connection.ops.quote_name(field.column)
        with connection.cursor() as cursor:
            cursor.execute(
                f'SELECT DISTINCT {quoted_column} FROM {quoted_table} '
                f'WHERE {quoted_column} IS NOT NULL'
            )
            values = [row[0] for row in cursor.fetchall()]
        for value in values:
            if str(value).isdigit():
                continue
            related_object, _ = related_lookup.get_or_create(
                **{lookup_field: str(value)}
            )
            with connection.cursor() as cursor:
                cursor.execute(
                    f'UPDATE {quoted_table} SET {quoted_column} = %s '
                    f'WHERE {quoted_column} = %s',
                    (related_object.pk, value),
                )
        if model_name == 'Participacao':
            initial_status = related_lookup.get(status='Inscrito')
            with connection.cursor() as cursor:
                cursor.execute(
                    f'UPDATE {quoted_table} SET {quoted_column} = %s '
                    f'WHERE {quoted_column} IS NULL',
                    (initial_status.pk,),
                )

        old_field = models.CharField(
            max_length=max_length,
            blank=nullable,
            null=nullable,
        )
        old_field.set_attributes_from_name(field_name)
        schema_editor.alter_field(model, old_field, field, strict=False)

    for model in domain_models:
        for constraint in model._meta.constraints:
            with connection.cursor() as cursor:
                constraints = connection.introspection.get_constraints(
                    cursor,
                    model._meta.db_table,
                )
            if constraint.name not in constraints:
                schema_editor.add_constraint(model, constraint)


class Migration(migrations.Migration):

    dependencies = [
        ('desafio', '0003_alter_avaliacao_options_alter_desafio_options_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='avaliacao',
                    name='participacao',
                    field=models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.participacao',
                    ),
                ),
                migrations.AddField(
                    model_name='desafio',
                    name='empresa',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.empresa',
                    ),
                ),
                migrations.AddField(
                    model_name='empresa',
                    name='area_atuacao',
                    field=models.CharField(blank=True, max_length=120),
                ),
                migrations.AlterField(
                    model_name='empresa',
                    name='cnpj',
                    field=models.CharField(
                        blank=True,
                        max_length=14,
                        null=True,
                        unique=True,
                    ),
                ),
                migrations.AddField(
                    model_name='empresa',
                    name='usuario',
                    field=models.OneToOneField(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='empresa',
                        to='desafio.usuario',
                    ),
                ),
                migrations.AddField(
                    model_name='interesseprofissional',
                    name='empresa',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.empresa',
                    ),
                ),
                migrations.AddField(
                    model_name='interesseprofissional',
                    name='participacao',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.participacao',
                    ),
                ),
                migrations.AddField(
                    model_name='participacao',
                    name='desafio',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.desafio',
                    ),
                ),
                migrations.AddField(
                    model_name='participacao',
                    name='empresa',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.empresa',
                    ),
                ),
                migrations.AddField(
                    model_name='participacao',
                    name='estudante',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.perfilestudante',
                    ),
                ),
                migrations.AlterField(
                    model_name='desafio',
                    name='nivel',
                    field=models.ForeignKey(
                        db_column='nivel',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to='desafio.niveis',
                    ),
                ),
                migrations.AlterField(
                    model_name='desafio',
                    name='status',
                    field=models.ForeignKey(
                        blank=True,
                        db_column='status',
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to='desafio.statusentrega',
                    ),
                ),
                migrations.AddField(
                    model_name='perfilestudante',
                    name='area_interesse',
                    field=models.CharField(blank=True, max_length=120),
                ),
                migrations.AddField(
                    model_name='perfilestudante',
                    name='usuario',
                    field=models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.usuario',
                    ),
                ),
                migrations.AddField(
                    model_name='reconhecimento',
                    name='participacao',
                    field=models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to='desafio.participacao',
                    ),
                ),
                migrations.AlterField(
                    model_name='interesseprofissional',
                    name='status',
                    field=models.ForeignKey(
                        db_column='status',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to='desafio.statusentrega',
                    ),
                ),
                migrations.AlterField(
                    model_name='participacao',
                    name='data_adesao',
                    field=models.DateTimeField(default=django.utils.timezone.now),
                ),
                migrations.AlterField(
                    model_name='participacao',
                    name='status',
                    field=models.ForeignKey(
                        db_column='status',
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        to='desafio.statusentrega',
                    ),
                ),
                migrations.AddConstraint(
                    model_name='interesseprofissional',
                    constraint=models.UniqueConstraint(
                        fields=('empresa', 'participacao'),
                        name='unique_company_participation_interest',
                    ),
                ),
                migrations.AddConstraint(
                    model_name='participacao',
                    constraint=models.UniqueConstraint(
                        fields=('estudante', 'desafio'),
                        name='unique_student_challenge_participation',
                    ),
                ),
            ],
        ),
        migrations.RunPython(ensure_current_schema, migrations.RunPython.noop),
    ]
