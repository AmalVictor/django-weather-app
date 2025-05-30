# Weather Dashboard

A full-stack weather application that allows users to check weather conditions for different cities and save their search history.

## Features
- Check current weather for any city
- User authentication
- Search history for logged-in users
- Beautiful, responsive UI

## Setup Instructions

### Backend Setup
1. Create and activate virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory and add your OpenWeather API key:
```
OPENWEATHER_API_KEY=your_api_key_here
```

4. Run migrations:
```bash
cd backend
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup
1. Install Node.js dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Project Structure
```
weather_dashboard/
├── backend/           # Django project
│   ├── api/          # Django app for our API
│   ├── requirements.txt
│   └── manage.py
└── frontend/         # React frontend
    ├── public/       # Static files
    ├── src/          # React source code
    └── package.json  # Node.js dependencies
```

## API Endpoints
- GET /api/weather/?city={city_name} - Get weather for a specific city
- GET /api/history/ - Get user's search history (requires authentication)
- POST /api/auth/register/ - Register a new user
- POST /api/auth/login/ - Login user
- POST /api/auth/logout/ - Logout user (requires authentication)
- GET /api/auth/user/ - Get current user details (requires authentication)

## Technologies Used
- Backend: Django, Django REST Framework
- Database: SQLite (default)
- API: OpenWeatherMap
- Frontend: React, TypeScript, Bootstrap
- Authentication: Token-based authentication 