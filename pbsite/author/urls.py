"""
    URL Pattern List for Author module
"""

from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('',
    
    # upload form
    url(r'^upload[/]$', 'pbsite.author.views.upload', name='author_upload'),            
)
