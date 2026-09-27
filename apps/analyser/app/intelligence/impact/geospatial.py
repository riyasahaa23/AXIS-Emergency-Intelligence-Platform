from typing import Any


def intersect_population(hazard_geometry: Any, population_geometry: Any) -> Any:
    """Intersect geometries when GeoPandas/Shapely are enabled."""
    try:
        import geopandas as gpd  # type: ignore[import-not-found,import-untyped]
    except ImportError as exc:
        raise RuntimeError("Install the 'geo' extra for geospatial analysis") from exc
    hazard = gpd.GeoDataFrame(geometry=[hazard_geometry], crs="EPSG:4326")
    population = gpd.GeoDataFrame(geometry=[population_geometry], crs="EPSG:4326")
    return hazard.overlay(population, how="intersection")
