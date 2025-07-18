from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update, delete, desc, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models import (
    User, Persona, Conversation, Message, Session, UserMemory, 
    MoodEntry, DiaryEntry, Goal, SessionAnalytic,
    UserCreate, ConversationCreate, MessageCreate, GoalCreate, 
    MoodEntryCreate, DiaryEntryCreate
)
from database import DatabaseManager

class Storage:
    """Storage layer for SoulSense AI application"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    async def get_session(self) -> AsyncSession:
        """Get database session"""
        return await self.db_manager.get_session()
    
    # User operations
    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
    
    async def upsert_user(self, user_data: UserCreate) -> User:
        """Create or update user"""
        async with await self.get_session() as session:
            # Check if user exists
            existing_user = await session.execute(
                select(User).where(User.id == user_data.id)
            )
            user = existing_user.scalar_one_or_none()
            
            if user:
                # Update existing user
                for field, value in user_data.model_dump(exclude_unset=True).items():
                    setattr(user, field, value)
                user.updated_at = datetime.utcnow()
            else:
                # Create new user
                user = User(**user_data.model_dump())
            
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user
    
    # Persona operations
    async def get_personas(self) -> List[Persona]:
        """Get all personas"""
        async with await self.get_session() as session:
            result = await session.execute(select(Persona))
            return result.scalars().all()
    
    async def get_persona(self, persona_id: str) -> Optional[Persona]:
        """Get persona by ID"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Persona).where(Persona.id == persona_id)
            )
            return result.scalar_one_or_none()
    
    # Conversation operations
    async def create_conversation(self, conversation_data: ConversationCreate) -> Conversation:
        """Create new conversation"""
        async with await self.get_session() as session:
            conversation = Conversation(**conversation_data.model_dump())
            session.add(conversation)
            await session.commit()
            await session.refresh(conversation)
            return conversation
    
    async def get_conversation(self, conversation_id: int) -> Optional[Conversation]:
        """Get conversation by ID with persona"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Conversation)
                .options(selectinload(Conversation.persona))
                .where(Conversation.id == conversation_id)
            )
            return result.scalar_one_or_none()
    
    async def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """Get all conversations for a user"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Conversation)
                .options(selectinload(Conversation.persona))
                .where(Conversation.user_id == user_id)
                .order_by(desc(Conversation.updated_at))
            )
            return result.scalars().all()
    
    async def get_conversation_by_user_and_persona(self, user_id: str, persona_id: str) -> Optional[Conversation]:
        """Get active conversation between user and persona"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Conversation)
                .options(selectinload(Conversation.persona))
                .where(
                    and_(
                        Conversation.user_id == user_id,
                        Conversation.persona_id == persona_id
                    )
                )
                .order_by(desc(Conversation.updated_at))
                .limit(1)
            )
            return result.scalar_one_or_none()
    
    async def update_conversation(self, conversation_id: int, updates: Dict[str, Any]) -> Optional[Conversation]:
        """Update conversation"""
        async with await self.get_session() as session:
            result = await session.execute(
                update(Conversation)
                .where(Conversation.id == conversation_id)
                .values(**updates, updated_at=datetime.utcnow())
                .returning(Conversation)
            )
            conversation = result.scalar_one_or_none()
            if conversation:
                await session.commit()
                await session.refresh(conversation)
            return conversation
    
    # Message operations
    async def create_message(self, message_data: MessageCreate) -> Message:
        """Create new message"""
        async with await self.get_session() as session:
            message = Message(**message_data.model_dump())
            session.add(message)
            await session.commit()
            await session.refresh(message)
            return message
    
    async def get_conversation_messages(self, conversation_id: int) -> List[Message]:
        """Get all messages for a conversation"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.timestamp)
            )
            return result.scalars().all()
    
    # Session operations
    async def create_session(self, session_data: Dict[str, Any]) -> Session:
        """Create therapy session"""
        async with await self.get_session() as session:
            therapy_session = Session(**session_data)
            session.add(therapy_session)
            await session.commit()
            await session.refresh(therapy_session)
            return therapy_session
    
    async def get_conversation_session(self, conversation_id: int) -> Optional[Session]:
        """Get session for conversation"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Session).where(Session.conversation_id == conversation_id)
            )
            return result.scalar_one_or_none()
    
    # Memory operations
    async def get_user_memories(self, user_id: str) -> List[UserMemory]:
        """Get user memories"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(UserMemory)
                .where(UserMemory.user_id == user_id)
                .order_by(desc(UserMemory.created_at))
            )
            return result.scalars().all()
    
    async def save_user_memory(self, user_id: str, memory_data: Dict[str, Any]) -> UserMemory:
        """Save user memory"""
        async with await self.get_session() as session:
            memory = UserMemory(user_id=user_id, **memory_data)
            session.add(memory)
            await session.commit()
            await session.refresh(memory)
            return memory
    
    # Mood operations
    async def create_mood_entry(self, user_id: str, mood_data: MoodEntryCreate) -> MoodEntry:
        """Create mood entry"""
        async with await self.get_session() as session:
            mood_entry = MoodEntry(user_id=user_id, **mood_data.model_dump())
            session.add(mood_entry)
            await session.commit()
            await session.refresh(mood_entry)
            return mood_entry
    
    async def get_user_mood_entries(self, user_id: str, range_days: int = 30) -> List[MoodEntry]:
        """Get user mood entries"""
        async with await self.get_session() as session:
            since_date = datetime.utcnow() - timedelta(days=range_days)
            result = await session.execute(
                select(MoodEntry)
                .where(
                    and_(
                        MoodEntry.user_id == user_id,
                        MoodEntry.created_at >= since_date
                    )
                )
                .order_by(desc(MoodEntry.created_at))
            )
            return result.scalars().all()
    
    # Diary operations
    async def create_diary_entry(self, user_id: str, diary_data: DiaryEntryCreate) -> DiaryEntry:
        """Create diary entry"""
        async with await self.get_session() as session:
            diary_entry = DiaryEntry(user_id=user_id, **diary_data.model_dump())
            session.add(diary_entry)
            await session.commit()
            await session.refresh(diary_entry)
            return diary_entry
    
    async def get_diary_entries(self, user_id: str) -> List[DiaryEntry]:
        """Get user diary entries"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(DiaryEntry)
                .where(DiaryEntry.user_id == user_id)
                .order_by(desc(DiaryEntry.created_at))
            )
            return result.scalars().all()
    
    async def update_diary_entry(self, entry_id: int, updates: Dict[str, Any]) -> Optional[DiaryEntry]:
        """Update diary entry"""
        async with await self.get_session() as session:
            result = await session.execute(
                update(DiaryEntry)
                .where(DiaryEntry.id == entry_id)
                .values(**updates, updated_at=datetime.utcnow())
                .returning(DiaryEntry)
            )
            entry = result.scalar_one_or_none()
            if entry:
                await session.commit()
                await session.refresh(entry)
            return entry
    
    async def delete_diary_entry(self, entry_id: int) -> bool:
        """Delete diary entry"""
        async with await self.get_session() as session:
            result = await session.execute(
                delete(DiaryEntry).where(DiaryEntry.id == entry_id)
            )
            await session.commit()
            return result.rowcount > 0
    
    # Goal operations
    async def create_goal(self, user_id: str, goal_data: GoalCreate) -> Goal:
        """Create goal"""
        async with await self.get_session() as session:
            goal = Goal(user_id=user_id, **goal_data.model_dump())
            session.add(goal)
            await session.commit()
            await session.refresh(goal)
            return goal
    
    async def get_user_goals(self, user_id: str) -> List[Goal]:
        """Get user goals"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Goal)
                .where(Goal.user_id == user_id)
                .order_by(desc(Goal.created_at))
            )
            return result.scalars().all()
    
    async def get_goal(self, goal_id: int) -> Optional[Goal]:
        """Get goal by ID"""
        async with await self.get_session() as session:
            result = await session.execute(
                select(Goal).where(Goal.id == goal_id)
            )
            return result.scalar_one_or_none()
    
    async def update_goal(self, goal_id: int, updates: Dict[str, Any]) -> Optional[Goal]:
        """Update goal"""
        async with await self.get_session() as session:
            result = await session.execute(
                update(Goal)
                .where(Goal.id == goal_id)
                .values(**updates, updated_at=datetime.utcnow())
                .returning(Goal)
            )
            goal = result.scalar_one_or_none()
            if goal:
                await session.commit()
                await session.refresh(goal)
            return goal
    
    async def delete_goal(self, goal_id: int) -> bool:
        """Delete goal"""
        async with await self.get_session() as session:
            result = await session.execute(
                delete(Goal).where(Goal.id == goal_id)
            )
            await session.commit()
            return result.rowcount > 0
    
    async def update_goal_status(self, goal_id: int, status: str, completed_date: Optional[datetime] = None) -> Optional[Goal]:
        """Update goal status"""
        updates = {"status": status}
        if completed_date:
            updates["completed_date"] = completed_date
        if status == "completed":
            updates["progress"] = 100
        
        return await self.update_goal(goal_id, updates)
    
    # Analytics operations
    async def create_session_analytic(self, user_id: str, analytic_data: Dict[str, Any]) -> SessionAnalytic:
        """Create session analytic"""
        async with await self.get_session() as session:
            analytic = SessionAnalytic(user_id=user_id, **analytic_data)
            session.add(analytic)
            await session.commit()
            await session.refresh(analytic)
            return analytic
    
    async def get_user_session_analytics(self, user_id: str, days: int = 30) -> List[SessionAnalytic]:
        """Get user session analytics"""
        async with await self.get_session() as session:
            since_date = datetime.utcnow() - timedelta(days=days)
            result = await session.execute(
                select(SessionAnalytic)
                .where(
                    and_(
                        SessionAnalytic.user_id == user_id,
                        SessionAnalytic.created_at >= since_date
                    )
                )
                .order_by(desc(SessionAnalytic.created_at))
            )
            return result.scalars().all()
    
    # Dashboard analytics
    async def get_user_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive dashboard data for user"""
        async with await self.get_session() as session:
            # Get conversations
            conversations = await self.get_user_conversations(user_id)
            
            # Get mood entries
            mood_entries = await self.get_user_mood_entries(user_id)
            
            # Get goals
            goals = await self.get_user_goals(user_id)
            
            # Get session analytics
            analytics = await self.get_user_session_analytics(user_id)
            
            # Calculate statistics
            total_sessions = len(analytics)
            current_streak = await self._calculate_current_streak(user_id)
            average_mood = sum(entry.mood_rating for entry in mood_entries) / len(mood_entries) if mood_entries else 0
            
            # Find favorite persona
            persona_counts = {}
            for conversation in conversations:
                persona_id = conversation.persona_id
                persona_counts[persona_id] = persona_counts.get(persona_id, 0) + 1
            
            favorite_persona = max(persona_counts, key=persona_counts.get) if persona_counts else "sarah"
            
            # Goal statistics
            completed_goals = [g for g in goals if g.status == "completed"]
            
            return {
                "total_sessions": total_sessions,
                "current_streak": current_streak,
                "average_mood": average_mood,
                "favorite_persona": favorite_persona,
                "conversations": conversations,
                "mood_entries": mood_entries,
                "goals": goals,
                "completed_goals": len(completed_goals),
                "session_analytics": analytics
            }
    
    async def _calculate_current_streak(self, user_id: str) -> int:
        """Calculate current daily streak"""
        async with await self.get_session() as session:
            # Get analytics for the last 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            result = await session.execute(
                select(SessionAnalytic)
                .where(
                    and_(
                        SessionAnalytic.user_id == user_id,
                        SessionAnalytic.created_at >= thirty_days_ago
                    )
                )
                .order_by(desc(SessionAnalytic.created_at))
            )
            analytics = result.scalars().all()
            
            if not analytics:
                return 0
            
            # Group by date and calculate streak
            dates_with_sessions = set()
            for analytic in analytics:
                date = analytic.created_at.date()
                dates_with_sessions.add(date)
            
            # Calculate consecutive days
            current_date = datetime.utcnow().date()
            streak = 0
            
            while current_date in dates_with_sessions:
                streak += 1
                current_date = current_date - timedelta(days=1)
            
            return streak
    
    # User profile operations
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile with dashboard data"""
        user = await self.get_user(user_id)
        if not user:
            return None
        
        dashboard_data = await self.get_user_dashboard_data(user_id)
        
        return {
            "userId": user.id,
            "name": user.name or f"{user.first_name} {user.last_name}".strip(),
            "bio": user.bio or "Your wellness journey continues here. Track your progress and achieve your goals.",
            "pronouns": user.pronouns,
            "moodTagline": user.mood_tagline,
            "avatar": user.profile_image_url,
            "preferences": user.preferences or {},
            "stats": {
                "totalSessions": dashboard_data["total_sessions"],
                "currentStreak": dashboard_data["current_streak"],
                "averageMood": dashboard_data["average_mood"],
                "favoritePersona": dashboard_data["favorite_persona"]
            }
        }
    
    async def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile"""
        async with await self.get_session() as session:
            result = await session.execute(
                update(User)
                .where(User.id == user_id)
                .values(**updates, updated_at=datetime.utcnow())
                .returning(User)
            )
            user = result.scalar_one_or_none()
            if user:
                await session.commit()
                return await self.get_user_profile(user_id)
            return None