from django.conf.urls.defaults import patterns, include, url

from top.views import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'top.views.home', name='home'),
    # url(r'^top/', include('top.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^top/index.html', topindex),
    url(r'^top/rechome.html', recommendHome),
    url(r'^top/preview.html', previewTemplate),
    url(r'^top/use.html$', useTemplate),
    url(r'^top/stop.html$', stopTemplate),
    url(r'^top/error.html', toperror),
    url(r'^top/help.html', topshare),
    url(r'^top/history.html$', viewHistory),
    url(r'^top/ushow.html$', useShow),
)
