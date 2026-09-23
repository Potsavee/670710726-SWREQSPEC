from app.db.models import AuditLog, Booking, Slot
from conftest import table_columns


def test_T01_migration_creates_booking_tables_without_national_id(database_engine):
    """Verifies the T-01 completion condition for schema creation and HN-only booking identity."""
    assert set(database_engine.dialect.get_table_names(database_engine.connect())) == {
        "audit_logs",
        "bookings",
        "slots",
    }

    assert table_columns(database_engine, "bookings") == {
        "id",
        "hn",
        "slot_id",
        "booking_date",
        "queue_no",
        "status",
        "created_at",
    }
    assert "national_id" not in table_columns(database_engine, "bookings")
    assert Booking.__tablename__ == "bookings"
    assert Slot.__tablename__ == "slots"
    assert AuditLog.__tablename__ == "audit_logs"
