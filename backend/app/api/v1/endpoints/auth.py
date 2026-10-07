from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from app.models.user import UserCreate, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.mongodb import get_database
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    existing = await db.users.find_one({"email": user_in.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
        
    user_doc = {
        "full_name": user_in.full_name,
        "email": user_in.email,
        "hashed_password": get_password_hash(user_in.password),
        "role": user_in.role,
        "phone": user_in.phone,
        "region": user_in.region,
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    token = create_access_token(subject=user_id, role=user_in.role)
    
    user_res = UserResponse(
        id=user_id,
        full_name=user_in.full_name,
        email=user_in.email,
        role=user_in.role,
        phone=user_in.phone,
        region=user_in.region,
        created_at=user_doc["created_at"]
    )
    
    return Token(access_token=token, token_type="bearer", user=user_res)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection unavailable")
        
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    user_id = str(user["_id"])
    token = create_access_token(subject=user_id, role=user.get("role", "regional_observer"))
    
    user_res = UserResponse(
        id=user_id,
        full_name=user.get("full_name", ""),
        email=user.get("email", ""),
        role=user.get("role", "regional_observer"),
        phone=user.get("phone"),
        region=user.get("region", "Assam"),
        created_at=user.get("created_at", datetime.utcnow())
    )
    
    return Token(access_token=token, token_type="bearer", user=user_res)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.get("id", "")),
        full_name=current_user.get("full_name", "User"),
        email=current_user.get("email", ""),
        role=current_user.get("role", "regional_observer"),
        phone=current_user.get("phone"),
        region=current_user.get("region", "NER"),
        created_at=current_user.get("created_at", datetime.utcnow())
    )
