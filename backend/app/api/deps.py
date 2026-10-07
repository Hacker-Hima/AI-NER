from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.core.security import decode_access_token
from app.db.mongodb import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        # For public demo flexibility, return a guest regional observer if not logged in
        return {
            "id": "guest_observer",
            "full_name": "Guest Regional Observer",
            "email": "observer@ner.local",
            "role": "regional_observer"
        }
        
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload.get("sub")
    role = payload.get("role", "regional_observer")
    
    db = get_database()
    if db is not None:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user["_id"])
                return user
        except Exception:
            pass
            
    return {
        "id": user_id,
        "full_name": "Authenticated User",
        "email": payload.get("email", ""),
        "role": role
    }

def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
