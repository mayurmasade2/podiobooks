"""
WSGI config for the project, including NewRelic Wrapper.

This module contains the WSGI application used by Django's development server
and any production WSGI deployments. It should expose a module-level variable
named ``application``. Django's ``runserver`` and ``runfcgi`` commands discover
this application via the ``WSGI_APPLICATION`` setting.

Usually you will have the standard Django WSGI application here, but it also
might make sense to replace the whole Django WSGI application with a custom one
that later delegates to the Django one. For example, you could introduce WSGI
middleware here, or combine a Django application with an application of another
framework.

"""

# pylint: disable=C0103,F0401

import os
import newrelic.agent
from django.core.wsgi import get_wsgi_application

newrelic.agent.initialize('podiobooks/newrelic.ini', 'webfaction_dev')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "podiobooks.settings_webfaction_dev")

# This application object is used by any WSGI server configured to use this
# file. This includes Django's development server, if the WSGI_APPLICATION
# setting points here.
application = get_wsgi_application()

application = newrelic.agent.wsgi_application()(application)
