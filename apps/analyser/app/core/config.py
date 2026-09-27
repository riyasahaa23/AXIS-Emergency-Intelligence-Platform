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
    object_storage_dir: str = "data/object-store"
    database_url: str = ""
    redis_url: str = ""
    llm_provider: str = "none"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2"
    copernicus_catalog_url: str = "https://sh.dataspace.copernicus.eu/catalog/v1/search"
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
    ibtracs_data_url: str = "https://www.ncei.noaa.gov/products/international-best-track-archive"
    ghcnh_data_url: str = "https://www.ncei.noaa.gov/products/global-historical-climatology-network-hourly"
    copernicus_ems_url: str = "https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations-info/"
    india_hospitals_url: str = "https://www.data.gov.in/catalog/hospital-directory-national-health-portal"
    india_hospitals_api_url: str = "https://api.data.gov.in/resource"
    india_hospitals_api_key: str = ""
    india_hospitals_resource_id: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()


def validate_runtime_settings(settings: Settings) -> None:
    if settings.environment == "production" and not any(
        (settings.api_key_readonly, settings.api_key_operator, settings.api_key_admin)
    ):
        raise RuntimeError("Production requires AXIS_API_KEY_READONLY, AXIS_API_KEY_OPERATOR or AXIS_API_KEY_ADMIN")
