from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Fci_App', '0002_alter_crop_register_quantity'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='password',
            field=models.CharField(max_length=128),
        ),
    ]
