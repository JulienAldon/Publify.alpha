from setuptools import setup

setup(
    name='spotils-back',
    version='0.1',
    packages=['spotils_back'],
    install_requires=[
        'fastapi',
        'requests',
        'spotipy',
        'sqlalchemy',
        'psycopg2'
    ]
)