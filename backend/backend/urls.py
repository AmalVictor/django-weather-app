from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve as static_serve
from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Serve manifest.json from React build root
    re_path(r'^manifest.json$', serve, {'path': 'manifest.json', 'document_root': settings.REACT_BUILD_DIR}),

    # (Optional) serve favicon.ico similarly if needed
    re_path(r'^favicon.ico$', serve, {'path': 'favicon.ico', 'document_root': settings.REACT_BUILD_DIR}),

    # Catch-all route for React app
    re_path(r'^.*$', static_serve, {'path': 'index.html', 'document_root': settings.REACT_BUILD_DIR}),
]