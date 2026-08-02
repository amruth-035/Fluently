import logging
import sys


def setup_logging() -> None:
  """Configure application-wide logging to stdout."""
  logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
  )
