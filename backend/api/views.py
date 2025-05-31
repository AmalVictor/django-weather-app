from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.conf import settings
import requests
from .models import SearchHistory
from .serializers import SearchHistorySerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.generic import TemplateView

class WeatherView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        city = request.query_params.get('city')
        if not city:
            return Response({"error": "City parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        api_key = settings.OPENWEATHER_API_KEY
        if not api_key:
            return Response({"error": "API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        
        try:
            print(f"Making request to: {url}")
            response = requests.get(url)
            data = response.json()
            
            print(f"OpenWeather API Response: {response.status_code}")
            
            if response.status_code == 200:
                # Save search history for authenticated users
                if request.user.is_authenticated:
                    try:
                        print(f"Saving search history for user: {request.user.username}")
                        SearchHistory.objects.create(
                            user=request.user,
                            city=city,
                            country=data.get('sys', {}).get('country', ''),
                            temperature=data.get('main', {}).get('temp'),
                            weather_description=data.get('weather', [{}])[0].get('description', '')
                        )
                    except Exception as e:
                        print(f"Error saving search history: {str(e)}")
                        # Continue even if search history saving fails
                
                return Response(data)
            else:
                print(f"OpenWeather API Error: {data}")
                return Response(data, status=response.status_code)
        except Exception as e:
            import traceback
            print(f"Exception: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SaveSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        city = request.data.get('city')
        country = request.data.get('country', '')
        
        if not city:
            return Response({"error": "City is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        search = SearchHistory.objects.create(
            user=request.user,
            city=city,
            country=country
        )
        
        serializer = SearchHistorySerializer(search)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SearchHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        searches = SearchHistory.objects.filter(user=request.user)
        serializer = SearchHistorySerializer(searches, many=True)
        return Response(serializer.data)

class SearchHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view returns a list of all search history
        for the currently authenticated user.
        """
        return SearchHistory.objects.filter(user=self.request.user)

class UserRegistrationView(APIView):
    """
    API view for user registration
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response(
                {'error': 'Username, email, and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    """
    API view for user login
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get or create token
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class UserLogoutView(APIView):
    """
    API view for user logout
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Delete the token to logout
        try:
            request.user.auth_token.delete()
            return Response({'success': 'Successfully logged out'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserView(APIView):
    """
    API view to get current user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class CitySuggestionsView(APIView):
    """
    API view for getting city suggestions as you type
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([], status=status.HTTP_200_OK)

        api_key = settings.OPENWEATHER_API_KEY
        if not api_key:
            return Response(
                {"error": "API key not configured"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        url = f"http://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={api_key}"
        
        try:
            print(f"Making geocoding request: {url}")
            response = requests.get(url)
            data = response.json()
            
            if response.status_code != 200:
                print(f"OpenWeather API Error: {data}")
                return Response(
                    {"error": "Failed to fetch city suggestions"},
                    status=response.status_code
                )
            
            # Format the response to simplify it for the frontend
            suggestions = []
            for item in data:
                city_name = item.get('name', '')
                country = item.get('country', '')
                state = item.get('state', '')
                
                if city_name and country:
                    display_name = city_name
                    if state:
                        display_name += f", {state}"
                    display_name += f", {country}"
                    
                    suggestions.append({
                        'name': city_name,
                        'country': country,
                        'state': state,
                        'display_name': display_name
                    })
            
            return Response(suggestions)
        
        except Exception as e:
            print(f"Exception in city suggestions: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 
class FrontendAppView(TemplateView):
    template_name = "index.html"