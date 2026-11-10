from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = "sqlite:///./trusthire.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    """Create tables and add columns introduced after the first database file."""
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        rows = connection.execute(text("PRAGMA table_info(investigations)")).fetchall()
        columns = {row[1] for row in rows}

        if "summary" not in columns:
            connection.execute(text("ALTER TABLE investigations ADD COLUMN summary TEXT"))

        if "recommendations_json" not in columns:
            connection.execute(
                text("ALTER TABLE investigations ADD COLUMN recommendations_json TEXT")
            )

        if "extracted_json" not in columns:
            connection.execute(
                text("ALTER TABLE investigations ADD COLUMN extracted_json TEXT")
            )
