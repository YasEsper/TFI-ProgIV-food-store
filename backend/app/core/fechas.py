from datetime import datetime, timedelta, timezone

# Argentina no tiene horario de verano: siempre UTC-3
HORA_ARGENTINA = timezone(timedelta(hours=-3))


def ahora_utc() -> datetime:
    """Fecha y hora actual en UTC. En la base se guarda siempre en UTC."""
    return datetime.now(timezone.utc)


def inicio_de_hoy_utc() -> datetime:
    """Medianoche de hoy en Argentina, expresada en UTC: desde ahí cuenta "pedidos de hoy"."""
    hoy = datetime.now(HORA_ARGENTINA).replace(hour=0, minute=0, second=0, microsecond=0)
    return hoy.astimezone(timezone.utc)
