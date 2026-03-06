class Session:
    """Stores a single practice session: date, duration, notes, and audio file path."""

    def __init__(self, date, duration, notes="", audio_filepath=""):
        self.date=date
        self.duration=duration
        self.notes=notes
        self.audio_filepath=audio_filepath