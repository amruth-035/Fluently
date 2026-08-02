from pydantic import BaseModel, HttpUrl


class SessionAudioUrlResponse(BaseModel):
    url: HttpUrl
