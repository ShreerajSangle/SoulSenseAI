import os
# Add this block to load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Please install python-dotenv: pip install python-dotenv")
    import sys; sys.exit(1)

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# JWT settings
SECRET_KEY = os.getenv("SESSION_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token scheme
security = HTTPBearer(auto_error=False)

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None

class UserClaims(BaseModel):
    sub: str  # User ID
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    iat: datetime
    exp: datetime

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(user_id=user_id, email=payload.get("email"))
    except JWTError:
        return None

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """Get current user from request"""
    
    # For development, allow anonymous access
    if os.getenv("NODE_ENV") == "development":
        # Check for user_id in request body or query params
        if request.method == "POST":
            try:
                body = await request.json()
                if "user_id" in body:
                    return {"user_id": body["user_id"]}
            except:
                pass
        
        # Check query parameters
        user_id = request.query_params.get("user_id")
        if user_id:
            return {"user_id": user_id}
        
        # Default to anonymous user
        return {"user_id": "anonymous"}
    
    # Production authentication
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"user_id": token_data.user_id, "email": token_data.email}

async def get_user_id(request: Request) -> str:
    """Get user ID from request (simplified version)"""
    # For development, check various sources
    if os.getenv("NODE_ENV") == "development":
        # Check if user_id is already stored in request state
        if hasattr(request, 'state') and hasattr(request.state, 'user_id'):
            return request.state.user_id
            
        # Check query parameters
        user_id = request.query_params.get("user_id")
        if user_id:
            return user_id
        
        # Default to anonymous
        return "anonymous"
    
    # Production: require authentication
    # For now, default to anonymous in production too
    # TODO: Implement proper authentication
    return "anonymous"

def setup_auth(app):
    """Setup authentication routes and middleware"""
    
    @app.post("/api/auth/login")
    async def login(request: Request):
        """Login endpoint (placeholder for now)"""
        # In production, this would handle OAuth/OpenID Connect
        return {"message": "Login endpoint - implement OAuth flow"}
    
    @app.get("/api/auth/user")
    async def get_auth_user(request: Request):
        """Get current authenticated user"""
        user_id = await get_user_id(request)
        
        if not user_id or user_id == "anonymous":
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # For development, return mock user data
        if os.getenv("NODE_ENV") == "development":
            return {
                "id": user_id,
                "email": f"{user_id}@example.com",
                "first_name": "Demo",
                "last_name": "User",
                "name": "Demo User",
                "profile_image_url": None
            }
        
        # In production, fetch from database
        return {"user_id": user_id}
    
    @app.post("/api/auth/logout")
    async def logout():
        """Logout endpoint"""
        return {"message": "Logged out successfully"}

# Optional: Middleware for session management
class SessionMiddleware:
    """Session management middleware"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Add session handling logic here
            pass
        
        await self.app(scope, receive, send)