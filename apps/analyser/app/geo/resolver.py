from __future__ import annotations

import hashlib
import re

_COUNTRY_CENTROIDS: dict[str, tuple[float, float]] = {
    "albania": (41.15, 20.17), "angola": (-11.20, 17.87), "argentina": (-38.42, -63.62),
    "australia": (-25.27, 133.78), "brazil": (-14.24, -51.93), "canada": (56.13, -106.35),
    "chile": (-33.45, -70.67), "china": (35.86, 104.20), "greece": (39.07, 21.82),
    "indonesia": (-0.79, 113.92), "india": (22.97, 78.66), "italy": (41.87, 12.57),
    "japan": (36.20, 138.25), "mexico": (23.63, -102.55), "mozambique": (-18.67, 35.53),
    "myanmar": (21.92, 95.96), "new caledonia": (-20.90, 165.62), "paraguay": (-23.44, -58.44),
    "philippines": (12.88, 121.77), "russian federation": (61.52, 105.32), "serbia": (44.02, 21.01),
    "spain": (40.46, -3.75), "tanzania": (-6.37, 34.89), "thailand": (15.87, 100.99),
    "united states": (39.83, -98.58), "usa": (39.83, -98.58), "zambia": (-13.13, 27.85),
    "zimbabwe": (-19.02, 29.15),
}

_US_STATE_CENTROIDS: dict[str, tuple[float, float]] = {
    "al": (32.81, -86.79), "ak": (64.20, -149.49), "az": (34.05, -111.09), "ca": (36.78, -119.42),
    "co": (39.06, -105.31), "fl": (27.66, -81.52), "ga": (32.16, -82.90), "nd": (47.55, -99.78),
    "nv": (38.80, -116.42), "ny": (42.95, -75.53), "or": (43.80, -120.55), "tx": (31.97, -99.90),
    "ut": (39.32, -111.09), "wa": (47.40, -121.49),
}


def resolve_coordinates(location: str, title: str = "") -> tuple[float, float]:
    """Return provider coordinates or a stable regional fallback.

    Provider geometry is always preferred. For legacy rows that predate the
    coordinate columns, known country/state centroids keep the map useful.
    The final hash fallback is deterministic and explicitly approximate.
    """
    text = f"{location} {title}".strip()
    match = re.search(r"\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)", text)
    if match:
        first, second = float(match.group(1)), float(match.group(2))
        if -90 <= first <= 90 and -180 <= second <= 180:
            return first, second

    lowered = text.lower()
    for country, coords in _COUNTRY_CENTROIDS.items():
        if country in lowered:
            return coords
    state_match = re.search(r",\s*([a-z]{2})(?:\b|$)", location.lower())
    if state_match and state_match.group(1) in _US_STATE_CENTROIDS:
        return _US_STATE_CENTROIDS[state_match.group(1)]

    digest = hashlib.sha256(text.encode("utf-8")).digest()
    lat = (int.from_bytes(digest[:4], "big") / 2**32) * 140.0 - 70.0
    lng = (int.from_bytes(digest[4:8], "big") / 2**32) * 360.0 - 180.0
    return round(lat, 5), round(lng, 5)
