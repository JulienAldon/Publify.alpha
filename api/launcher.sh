#!/bin/sh

if [ -f .db-initialized ]; then
  touch .db-initialized
  pipenv run python populate_db.py
fi
pipenv run uvicorn main:app --host 0.0.0.0 --port 8082