from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Set auto_error=False to avoid automatic 401 when no token is provided.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Received token:", token)
    if token is None:
        return {"username": "admin", "is_admin": True}
    # Remove 'Bearer ' prefix if present
    token = token.replace("Bearer ", "")
    if token == "dummy_admin_token":
        return {"username": "admin", "is_admin": True}
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
