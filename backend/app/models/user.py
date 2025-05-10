from sqlalchemy import Column, Integer, String, Enum
from ..db.base_class import Base
import enum

class RoleEnum(enum.Enum):
    admin = "admin"
    student = "student"

from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.student, nullable=False)
    name = Column(String, nullable=True)

    # 新增：上傳論文關聯
    uploaded_papers = relationship("Paper", back_populates="uploader")
