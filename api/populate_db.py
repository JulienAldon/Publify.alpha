import models
from database import SessionLocal, engine
from main import pwd_context

db = SessionLocal()

models.Base.metadata.create_all(bind=engine)

db.commit()
db.close()