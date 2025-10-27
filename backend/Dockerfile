FROM python:3.14-slim

WORKDIR /www

# Installation des packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# copie du reste des fichiers
COPY . .

EXPOSE 8000
# prod cmd
CMD ["sh", "-c", "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000"]
