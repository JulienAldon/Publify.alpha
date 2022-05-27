from sqlalchemy.orm import Session

from .models import User, Sync
from .schemas import ItemCreate, UserCreate


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_spotify_id(db: Session, spotify_id: str):
    return db.query(User).filter(User.spotify_id == spotify_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, spotify_id):
    db_user = User(spotify_id=spotify_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id):
    a = db.query(User).filter(User.id==user_id).first()
    db.delete(a)
    db.commit()

def delete_sync(db: Session, sync_id):
    a = db.query(Sync).filter(Sync.id==sync_id).first()
    db.delete(a)
    db.commit()

def get_sync(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Sync).offset(skip).limit(limit).all()

def get_sync_by_content(db: Session, public: str, collaborative: str, owner_id: int):
    return db.query(Sync).filter(Sync.owner_id == owner_id, Sync.collaborative == collaborative, Sync.public == public ).first()

def get_sync_by_id(db: Session, sync_id: int):
    return db.query(Sync).filter(Sync.id == sync_id).first()

def get_sync_by_owner(db: Session, owner_id: int):
    return db.query(Sync).filter(Sync.owner_id == owner_id).all()

def create_user_sync(db: Session, item: ItemCreate, user_id: int):
    db_item = Sync(**item.dict(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item