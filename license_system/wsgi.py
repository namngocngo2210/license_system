"""
WSGI config for license_system project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from pathlib import Path
from django.core.wsgi import get_wsgi_application
from dotenv import load_dotenv

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'license_system.settings')

# Load .env file
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(env_path)

application = get_wsgi_application()
