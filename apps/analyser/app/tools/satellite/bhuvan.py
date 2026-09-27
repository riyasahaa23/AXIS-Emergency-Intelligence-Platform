from urllib.parse import urlencode


class BhuvanProvider:
    """Builds OGC WMS requests for configured Bhuvan thematic layers."""

    def __init__(self, wms_url: str) -> None:
        self.wms_url = wms_url

    def capabilities_url(self) -> str:
        if not self.wms_url:
            raise RuntimeError("AXIS_BHUVAN_WMS_URL is required for Bhuvan layers")
        return f"{self.wms_url}?{urlencode({'service': 'WMS', 'request': 'GetCapabilities'})}"

    def map_url(self, layer: str, bbox: list[float], width: int, height: int) -> str:
        if not self.wms_url:
            raise RuntimeError("AXIS_BHUVAN_WMS_URL is required for Bhuvan layers")
        params = {
            "service": "WMS", "request": "GetMap", "version": "1.3.0", "layers": layer,
            "styles": "", "crs": "EPSG:4326", "bbox": ",".join(map(str, bbox)),
            "width": width, "height": height, "format": "image/png", "transparent": "true",
        }
        return f"{self.wms_url}?{urlencode(params)}"
