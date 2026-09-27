from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AXIS_", env_file=".env", extra="ignore")

    environment: str = "development"
    host: str = "127.0.0.1"
    port: int = 8000
    log_level: str = "INFO"
    api_key_readonly: str = ""
    api_key_operator: str = ""
    api_key_admin: str = ""
    allow_anonymous_demo: bool = True
    auto_migrate: bool = False
    scheduler_poll_seconds: int = 5
    rate_limit_per_minute: int = 120
    websocket_rate_limit_per_minute: int = 20
    object_storage_dir: str = "data/object-store"
    object_storage_backend: str = "local"
    object_storage_bucket: str = "axis"
    object_storage_endpoint: str = ""
    object_storage_region: str = "us-east-1"
    object_storage_access_key: str = ""
    object_storage_secret_key: str = ""
    database_url: str = ""
    redis_url: str = ""
    llm_provider: str = "none"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2"
    copernicus_catalog_url: str = "https://sh.dataspace.copernicus.eu/catalog/v1/search"
    copernicus_land_cover_stac_url: str = "https://stac.dataspace.copernicus.eu/v1"
    copernicus_client_id: str = ""
    copernicus_client_secret: str = ""
    firms_source: str = "VIIRS_NOAA20_NRT"
    firms_days: int = 1
    firms_map_key: str = ""
    bhuvan_api_url: str = "https://bhuvan-app1.nrsc.gov.in/api/"
    bhuvan_api_token: str = ""
    bhuvan_wms_url: str = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms"
    bhuvan_wmts_url: str = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/gwc/service/wmts"
    usgs_api_url: str = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    gdacs_api_url: str = "https://www.gdacs.org/gdacsapi"
    ecmwf_data_url: str = "https://data.ecmwf.int/"
    ecmwf_aws_url: str = "https://ecmwf-forecasts.s3.eu-central-1.amazonaws.com"
    imerg_data_url: str = "https://gpm.nasa.gov/data/imerg"
    imerg_archive_url: str = "https://arthurhouhttps.pps.eosdis.nasa.gov/gpmdata/"
    imerg_access_token: str = ""
    ibtracs_data_url: str = "https://www.ncei.noaa.gov/products/international-best-track-archive"
    ibtracs_base_url: str = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01"
    ghcnh_data_url: str = "https://www.ncei.noaa.gov/products/global-historical-climatology-network-hourly"
    ghcnh_base_url: str = "https://www.ncei.noaa.gov/oa/global-historical-climatology-network/hourly"
    copernicus_ems_url: str = "https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations-info/"
    india_hospitals_url: str = "https://www.data.gov.in/catalog/hospital-directory-national-health-portal"
    india_hospitals_api_url: str = "https://api.data.gov.in/resource"
    india_hospitals_api_key: str = ""
    india_hospitals_resource_id: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


def validate_runtime_settings(settings: Settings) -> None:
    if settings.llm_provider not in {"none", "ollama", "pydantic_ai"}:
        raise RuntimeError("AXIS_LLM_PROVIDER must be one of: none, ollama, pydantic_ai")
    if settings.object_storage_backend not in {"local", "s3"}:
        raise RuntimeError("AXIS_OBJECT_STORAGE_BACKEND must be local or s3")
    if settings.object_storage_backend == "s3" and not settings.object_storage_bucket:
        raise RuntimeError("S3 object storage requires AXIS_OBJECT_STORAGE_BUCKET")
    if settings.environment == "production" and not any(
        (settings.api_key_readonly, settings.api_key_operator, settings.api_key_admin)
    ):
        raise RuntimeError("Production requires AXIS_API_KEY_READONLY, AXIS_API_KEY_OPERATOR or AXIS_API_KEY_ADMIN")
