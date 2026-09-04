from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "{{projectName}}"
    stack: str = "{{stack}}"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/{{projectName}}"
{{#if (or (eq decision_caching "redis") (eq decision_queue "celery") (eq decision_queue "arq") (eq decision_backgroundJobs "celery-beat") (eq decision_streaming "redis-streams"))}}
    redis_url: str = "redis://localhost:6379/0"
{{/if}}{{#if (eq decision_streaming "kafka")}}
    kafka_brokers: str = "localhost:9092"
{{/if}}{{#if (eq decision_search "meilisearch")}}
    meili_url: str = "http://localhost:7700"
    meili_master_key: str = "masterKey"
{{/if}}{{#if (eq decision_search "elasticsearch")}}
    elasticsearch_url: str = "http://localhost:9200"
{{/if}}{{#if (eq decision_fileStorage "s3")}}
    aws_s3_bucket: str = "my-bucket"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
{{/if}}


@lru_cache
def get_settings() -> Settings:
    return Settings()
