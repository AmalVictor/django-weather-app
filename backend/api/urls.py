from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeatherView, SearchHistoryViewSet, UserRegistrationView, UserLoginView, UserLogoutView, UserView, SaveSearchView, SearchHistoryView, CitySuggestionsView
from django.urls import re_path
from .views import FrontendAppView


router = DefaultRouter()
router.register(r'history', SearchHistoryViewSet, basename='history')

urlpatterns = [
    path('weather/', WeatherView.as_view(), name='weather'),
    path('city-suggestions/', CitySuggestionsView.as_view(), name='city-suggestions'),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/logout/', UserLogoutView.as_view(), name='logout'),
    path('auth/user/', UserView.as_view(), name='user'),
    path('save-search/', SaveSearchView.as_view(), name='save-search'),
    path('search-history/', SearchHistoryView.as_view(), name='search-history'),
    path('', include(router.urls)),
    re_path(r"^(?:.*)/?$", FrontendAppView.as_view()),
] 