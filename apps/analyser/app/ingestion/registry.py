from .models import SourceDefinition


def _api(id: str, name: str, publisher: str, endpoint: str, priority: str, description: str, configured: bool = False):
    return SourceDefinition(id=id, name=name, publisher=publisher, endpoint=endpoint, kind="api", priority=priority, description=description, requires_configuration=configured)


def _dataset(id: str, name: str, publisher: str, endpoint: str, priority: str, description: str, configured: bool = False):
    return SourceDefinition(id=id, name=name, publisher=publisher, endpoint=endpoint, kind="dataset", priority=priority, description=description, requires_configuration=configured)


SOURCE_REGISTRY: dict[str, SourceDefinition] = {
    "gdacs": _api("gdacs", "Global Disaster Alert and Coordination System", "GDACS", "https://www.gdacs.org/gdacsapi/api/Events/geteventlist/SEARCH", "must_have", "Global disaster event and alert metadata."),
    "ecmwf": _dataset("ecmwf", "ECMWF Open Data", "ECMWF", "https://www.ecmwf.int/en/forecasts/datasets/open-data", "must_have", "Global numerical weather forecasts."),
    "gpm_imerg": _dataset("gpm_imerg", "NASA GPM IMERG", "NASA", "https://gpm.nasa.gov/data/imerg", "must_have", "Precipitation observations and accumulation."),
    "bhuvan_lulc": _api("bhuvan_lulc", "Bhuvan LULC and Thematic APIs", "ISRO/NRSC", "https://bhuvan-app1.nrsc.gov.in/api/", "must_have", "Indian LULC statistics, AOI analysis, mapping and related geospatial services."),
    "firms": _api("firms", "NASA FIRMS", "NASA", "https://firms.modaps.eosdis.nasa.gov/api/", "must_have", "Near-real-time active-fire detections.", True),
    "usgs_earthquakes": _api("usgs_earthquakes", "USGS Earthquakes", "USGS", "https://earthquake.usgs.gov/fdsnws/event/1/query", "must_have", "Machine-readable earthquake events."),
    "ibtracs": _dataset("ibtracs", "NOAA IBTrACS", "NOAA", "https://www.ncei.noaa.gov/products/international-best-track-archive", "must_have", "Historical and current tropical-cyclone tracks."),
    "ghcnh": _dataset("ghcnh", "NOAA GHCNh", "NOAA", "https://www.ncei.noaa.gov/products/global-historical-climatology-network-hourly", "must_have", "Historical hourly weather-station observations."),
    "worldpop": _dataset("worldpop", "WorldPop", "WorldPop", "https://www.worldpop.org/datacatalog/", "must_have", "Population exposure rasters."),
    "inform": _dataset("inform", "INFORM Risk Index", "European Commission JRC", "https://drmkc.jrc.ec.europa.eu/inform-index/INFORM-Risk/Results-and-data", "must_have", "Baseline vulnerability and coping-capacity indicators."),
    "ocha_cod": _dataset("ocha_cod", "OCHA Common Operational Datasets", "OCHA", "https://data.humdata.org/", "must_have", "Humanitarian boundaries, population and standard codes."),
    "osm_overpass": _api("osm_overpass", "OpenStreetMap Overpass", "OpenStreetMap", "https://overpass-api.de/api/interpreter", "must_have", "Selected roads, hospitals, shelters and infrastructure."),
    "geofabrik": _dataset("geofabrik", "Geofabrik OSM extracts", "Geofabrik", "https://download.geofabrik.de/", "must_have", "Bulk OSM PBF extracts for network loading."),
    "osrm": _api("osrm", "OSRM Routing", "OSRM", "https://router.project-osrm.org", "must_have", "Routes, travel times and distance matrices."),
    "copernicus_dem": _dataset("copernicus_dem", "Copernicus DEM", "Copernicus", "https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM", "must_have", "Elevation and terrain analysis."),
    "global_surface_water": _dataset("global_surface_water", "JRC Global Surface Water", "European Commission JRC", "https://global-surface-water.appspot.com/download", "should_have", "Historical water occurrence and surface-water layers."),
    "copernicus_land_cover": _dataset("copernicus_land_cover", "Copernicus Global Dynamic Land Cover", "Copernicus", "https://land.copernicus.eu/en/products/global-dynamic-land-cover", "should_have", "Land-cover context for hazard impact."),
    "copernicus_ems": _api("copernicus_ems", "Copernicus EMS Rapid Mapping", "Copernicus", "https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations-info/", "should_have", "Rapid Mapping activations and products."),
    "reliefweb": _api("reliefweb", "ReliefWeb", "UN OCHA", "https://api.reliefweb.int/v2/reports", "should_have", "Humanitarian situation reports."),
    "hdx_hapi": _api("hdx_hapi", "HDX HAPI", "Humanitarian Data Exchange", "https://hapi.humdata.org/api/", "should_have", "Standardized humanitarian indicators.", True),
    "who_health_facilities": _dataset("who_health_facilities", "WHO Geolocated Health Facilities", "WHO", "https://www.who.int/data/GIS/GHFD", "must_have", "Global health-facility master data."),
    "emdat": _dataset("emdat", "EM-DAT", "CRED", "https://doc.emdat.be/docs/data-accessibility/", "should_have", "Historical disaster impact records.", True),
    "imd": _api("imd", "India Meteorological Department", "IMD", "https://api.imd.gov.in/public/api_reference.html", "must_have", "Indian forecasts, warnings and rainfall."),
    "sachet": _api("sachet", "NDMA SACHET", "NDMA", "https://sachet.ndma.gov.in/CapFeed", "must_have", "Indian CAP/RSS disaster alerts."),
    "india_hospitals": _dataset("india_hospitals", "India Hospital Directory", "Government of India", "https://www.data.gov.in/catalog/hospital-directory-national-health-portal", "must_have", "India-specific hospital locations and metadata."),
}
