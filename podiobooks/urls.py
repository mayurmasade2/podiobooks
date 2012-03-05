"""
    Master URL Pattern List for the application.  Most of the patterns here should be top-level
    pass-offs to sub-modules, who will have their own urls.py defining actions within.
"""

# pylint: disable=E0602,F0401

from django.conf.urls.defaults import * #@UnusedWildImport # pylint: disable=W0401,W0614
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings

admin.autodiscover()

urlpatterns = patterns('',
    # Home Page
    url(r'^$', 'podiobooks.core.views.index', name="home_page"),
                       
    # URLs from core package
    (r'^', include('podiobooks.core.urls')),

    # Admin documentation
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Admin Site
    (r'^admin/', include(admin.site.urls)),
    
    # Auth / Login
    (r'^account/signin/$', 'django.contrib.auth.views.login'),

    # Django Comments
    (r'^comments/', include('django.contrib.comments.urls')),
    
    # Profile
    (r'^profile/', include('podiobooks.profile.urls')),
    
    # Feeds
    (r'^rss/', include('podiobooks.feeds.urls')),
)
    
# Databrowse setup
from django.contrib import databrowse
from podiobooks.core.models import Category, Contributor, Episode, Title

databrowse.site.register(Category)
databrowse.site.register(Contributor)
databrowse.site.register(Episode)
databrowse.site.register(Title)

urlpatterns += patterns('',
        (r'^db/(.*)', databrowse.site.root),
)

#Only hook up the static and media to run through Django in a dev environment...in prod, needs to be handled by web server
if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
            }),
    )