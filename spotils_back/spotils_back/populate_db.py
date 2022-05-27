from . import models
from .database import SessionLocal, engine

db = SessionLocal()

models.Base.metadata.create_all(bind=engine)

db.commit()
db.close()