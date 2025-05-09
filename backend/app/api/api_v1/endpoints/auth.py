from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ....db.session import get_db
from ....schemas.user import UserCreate, UserResponse, LoginRequest, LoginResponse
from ....models.user import User, RoleEnum
from ....models.login_attempt import LoginAttempt
from ....services import auth
import jwt

router = APIRouter()

# In production, use a secure method to manage secrets
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    password_hash = auth.get_password_hash(user.password)
    new_user = User(username=user.username, password_hash=password_hash, role=RoleEnum(user.role))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=LoginResponse)
def login(login_req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip_address = request.client.host
    db_user = db.query(User).filter(User.username == login_req.username).first()
    if not db_user:
        log_attempt = LoginAttempt(username=login_req.username, success=False, ip_address=ip_address)
        db.add(log_attempt)
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    if not auth.verify_password(login_req.password, db_user.password_hash):
        log_attempt = LoginAttempt(user_id=db_user.id, username=db_user.username, success=False, ip_address=ip_address)
        db.add(log_attempt)
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    # Record successful login
    log_attempt = LoginAttempt(user_id=db_user.id, username=db_user.username, success=True, ip_address=ip_address)
    db.add(log_attempt)
    db.commit()
    # Generate JWT token
    payload = {"sub": db_user.username, "id": db_user.id, "role": db_user.role.value}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return LoginResponse(access_token=token)
