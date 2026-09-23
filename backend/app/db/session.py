import os

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


def database_url() -> str:
    """Returns the configured PostgreSQL connection URL (CON-TECH-01)."""
    return os.getenv("DATABASE_URL", "postgresql+psycopg://localhost/booking")


engine = create_engine(database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, class_=Session, expire_on_commit=False)


def get_session():
    """Provides a database session for feature services (CON-TECH-01)."""
    with SessionLocal() as session:
        yield session
