from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    cors_origins: str = Field(default="http://localhost:5173,http://127.0.0.1:5173", alias="CORS_ORIGINS")
    max_file_mb: int = Field(default=50, alias="MAX_FILE_MB")
    debug: bool = Field(default=False, alias="DEBUG")

    def cors_list(self) -> list[str]:
        raw = (self.cors_origins or "").strip()
        if raw == "*" or raw == "":
            return ["*"]
        return [x.strip() for x in raw.split(",") if x.strip()]

settings = Settings()