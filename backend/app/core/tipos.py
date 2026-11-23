from typing import Annotated

from pydantic import StringConstraints

# Texto obligatorio: se quitan los espacios de los extremos y debe quedar al menos
# un carácter. Con min_length=1 solo, "   " sería válido (RN-01 y RN-10).
TextoObligatorio = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)
]
