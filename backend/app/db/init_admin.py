import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, RoleEnum
from app.services.auth import get_password_hash
from app.db.session import engine
from app.db.base_class import Base

def init_admin():
    # Create tables if they do not exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    # 檢查是否已經存在管理員帳號
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin_account = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role=RoleEnum.admin
        )
        db.add(admin_account)
        db.commit()
        print("管理員帳號已建立。")
    else:
        print("管理員帳號已存在。")

if __name__ == "__main__":
    init_admin()
