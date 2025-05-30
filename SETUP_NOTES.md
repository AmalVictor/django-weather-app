# Setup Notes for Weather Dashboard

## Backend Setup

1. You will need to create a `.env` file in the backend directory with your OpenWeather API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```
   
   Get a free API key from [OpenWeather](https://home.openweathermap.org/api_keys) if you don't have one.

2. Make sure to run migrations and create a superuser:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py createsuperuser
   ```

## Frontend Setup

1. React app will connect to the backend at http://localhost:8000/api by default.

2. If you want to change the API URL, create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

## Running the Application

1. Start the backend server first:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py runserver
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Navigate to http://localhost:3000 in your browser to use the application.

4. You should register a new user through the UI to be able to save your search history. 