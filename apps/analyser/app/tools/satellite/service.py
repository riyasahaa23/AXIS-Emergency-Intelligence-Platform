from app.core.config import get_settings

from .bhuvan import BhuvanProvider
from .copernicus import CopernicusProvider
from .firms import FirmsProvider
from .models import FireSearchRequest, SatelliteLayerRequest, SatelliteSearchRequest


class SatelliteService:
    def __init__(self) -> None:
        settings = get_settings()
        self.copernicus = CopernicusProvider(settings.copernicus_catalog_url)
        self.firms = FirmsProvider(settings.firms_map_key, settings.firms_source)
        self.bhuvan = BhuvanProvider(settings.bhuvan_wms_url)

    async def search(self, request: SatelliteSearchRequest):
        return await self.copernicus.search(request)

    async def fires(self, request: FireSearchRequest):
        return await self.firms.fires(request)

    def layer_url(self, request: SatelliteLayerRequest) -> str:
        return self.bhuvan.map_url(request.layer, request.bbox, request.width, request.height)
