from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class MonitoringRun(Base):
    __tablename__ = "monitoring_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    upload_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    upload_path: Mapped[str] = mapped_column(String(1024), nullable=False)

    output_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    output_path: Mapped[str] = mapped_column(String(1024), nullable=False)

    model_path: Mapped[str] = mapped_column(String(1024), nullable=False)

    counts: Mapped[dict] = mapped_column(JSON, nullable=False)
    cleanliness_score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)

