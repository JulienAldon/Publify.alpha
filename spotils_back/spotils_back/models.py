from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base

class Sync(Base):
    __tablename__ = "syncs"
    id = Column(Integer, primary_key=True, index=True)
    collaborative = Column(String(64))
    collaborative_name = Column(String(64))
    public = Column(String(64))
    public_name = Column(String(64))
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship('User', back_populates='syncs')


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    spotify_id = Column(String)
    name = Column(String)
    syncs = relationship('Sync', back_populates="owner")