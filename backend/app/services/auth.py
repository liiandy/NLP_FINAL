from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

# Set auto_error=False to avoid automatic 401 when no token is provided.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Received token:", token)
    if not token:
        raise HTTPException(status_code=401, detail="Token is missing")
    # Remove 'Bearer ' prefix if present
    token = token.replace("Bearer ", "")
    if token == "dummy_admin_token":
        raise HTTPException(status_code=401, detail="Invalid token")
    # 在此可加入其他 token 驗證邏輯
    raise HTTPException(status_code=401, detail="Invalid token")

def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    """
    Dependency that verifies if the current user is an admin.
    Raises an HTTPException if the user does not have admin privileges.
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    return current_user

# 密碼加密與驗證邏輯
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        print("verify_password: No hashed_password provided")
        return False
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"verify_password: plain_password='{plain_password}', hashed_password='{hashed_password}' => {result}")
        return result
    except Exception as e:
        print("Password verification failed:", e)
        return False
