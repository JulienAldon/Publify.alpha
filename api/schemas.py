from typing import List, Optional

from pydantic import BaseModel


class SyncBase(BaseModel):
    collaborative: str
    public: str


class ItemCreate(SyncBase):
    pass


class Sync(SyncBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    name: str
    
class UserCreate(UserBase):
    spotify_id: str

class User(UserBase):
    id: int
    syncs: List[Sync] = []

    class Config:
        orm_mode = True