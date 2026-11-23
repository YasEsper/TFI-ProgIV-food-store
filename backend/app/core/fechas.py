from datetime import datetime, timezone


def ahora_utc() -> datetime:
    """Fecha y hora actual en UTC. En la base se guarda siempre en UTC."""
    return datetime.now(timezone.utc)