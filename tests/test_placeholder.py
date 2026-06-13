import re

import ragaxis


def test_placeholder() -> None:
    assert re.fullmatch(r"\d+\.\d+\.\d+", ragaxis.__version__)
