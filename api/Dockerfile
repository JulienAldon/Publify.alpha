FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9

RUN  apt-get update && apt-get install -y
RUN  pip3 install pipenv
COPY . /app
RUN  pipenv install

EXPOSE 8000

CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]