FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

COPY . /app

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]