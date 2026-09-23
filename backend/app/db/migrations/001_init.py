from sqlalchemy.engine import Engine

from app.db.models import Base


def upgrade(engine: Engine) -> None:
    """Creates the booking tables required by the feature (CON-TECH-01)."""
    Base.metadata.create_all(engine)
