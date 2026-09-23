import importlib.util
from pathlib import Path

import pytest
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session


_migration_path = Path(__file__).parents[1] / "app" / "db" / "migrations" / "001_init.py"
_migration_spec = importlib.util.spec_from_file_location("booking_initial_migration", _migration_path)
_migration_module = importlib.util.module_from_spec(_migration_spec)
assert _migration_spec.loader is not None
_migration_spec.loader.exec_module(_migration_module)
upgrade = _migration_module.upgrade


@pytest.fixture
def database_engine():
    """Creates an in-memory database for migration verification (CON-TECH-01)."""
    database_engine = create_engine("sqlite:///:memory:")
    upgrade(database_engine)
    return database_engine


@pytest.fixture
def database_session(database_engine):
    """Provides a session against the migrated test database (CON-TECH-01)."""
    with Session(database_engine) as session:
        yield session


def table_columns(database_engine, table_name: str) -> set[str]:
    """Returns database columns for schema assertions (IF-HIS-01)."""
    return {column["name"] for column in inspect(database_engine).get_columns(table_name)}
