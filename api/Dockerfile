FROM python:3.9

WORKDIR /auth

RUN  apt-get update && apt-get install -y
RUN  pip3 install pipenv
COPY Pipfile Pipfile.lock /auth/
RUN  pipenv install

COPY . /auth

EXPOSE 8082

CMD ["sh", "launcher.sh"]