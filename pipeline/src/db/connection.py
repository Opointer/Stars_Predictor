from __future__ import annotations

from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row


@contextmanager
def get_connection(database_url: str):
    with psycopg.connect(database_url, row_factory=dict_row) as connection:
        yield connection
