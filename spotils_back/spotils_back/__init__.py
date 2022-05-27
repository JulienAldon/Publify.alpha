import sys

print("sys:", sys.path)
print("env:", os.getenv('PYTHONPATH'))

from .main import app