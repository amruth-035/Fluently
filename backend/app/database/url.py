def normalize_database_url(url: str) -> str:
    """Use pg8000 on platforms where psycopg2 wheels are unavailable."""
    if url.startswith("postgresql+psycopg2://"):
        return url.replace("postgresql+psycopg2://", "postgresql+pg8000://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+pg8000://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+pg8000://", 1)
    return url
