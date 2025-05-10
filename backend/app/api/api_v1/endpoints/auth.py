from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ....db.session import get_db
from ....schemas.user import UserCreate, UserResponse, LoginRequest, LoginResponse
from ....models.user import User, RoleEnum
from ....models.login_attempt import LoginAttempt
from ....services import auth
import jwt
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

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
    try:
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        if isinstance(token, bytes):
            token = token.decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token generation error: " + str(e))
    return LoginResponse(access_token=token)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"user": {"id": current_user.id, "name": current_user.name, "username": current_user.username, "avatar": current_user.avatar, "role": current_user.role.value}}
