import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../..'))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, RoleEnum
from app.services.auth import get_password_hash
from app.db.session import engine
from app.db.base_class import Base

def init_student():
    # Create tables if they do not exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    # 檢查是否已經存在管理員帳號
    student = db.query(User).filter(User.username == "student").first()
    if not student:
        students_account = User(
            username="s313112015",
            password_hash=get_password_hash("s313112015"),
            role=RoleEnum.student,
            name = '李彥勳'
        )
        db.add(students_account)
        db.commit()
        print("學生帳號已建立。")
    else:
        print("學生帳號已存在。")

if __name__ == "__main__":
    init_student()
