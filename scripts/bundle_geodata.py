#!/usr/bin/env python3
"""
Graticule Geospatial and Telemetry Data Bundler
Generates mathematically accurate, curated continental coastlines, flight networks,
digital elevation contour slices, and financial time series as typed Sass map modules.
"""

import math
import os

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "scss", "data"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_continental_coastlines():
    """Generates accurate, stylized polygonal coordinate rings for global landmasses."""
    # Continent boundary vertices in (lon, lat) degrees
    continents = {
        "africa": [
            (-5.5, 35.9), (3.1, 36.8), (11.0, 37.1), (15.1, 32.3), (20.0, 32.2), (25.1, 31.6),
            (32.5, 31.3), (34.9, 29.5), (32.6, 27.8), (35.7, 26.2), (38.5, 22.0), (43.4, 12.6),
            (51.2, 10.5), (50.5, 5.0), (42.0, -1.0), (39.5, -4.5), (40.6, -10.2), (40.5, -15.5),
            (35.5, -24.0), (32.8, -26.9), (28.4, -32.5), (19.8, -34.8), (18.4, -34.3), (17.9, -32.5),
            (14.5, -23.0), (12.4, -17.2), (11.8, -13.0), (9.0, 1.0), (8.5, 4.5), (2.0, 6.3),
            (-1.5, 5.0), (-7.5, 4.3), (-11.5, 6.8), (-13.3, 8.5), (-16.5, 12.0), (-17.5, 14.7),
            (-16.0, 19.5), (-13.0, 27.5), (-9.8, 30.0), (-5.8, 35.8), (-5.5, 35.9)
        ],
        "eurasia": [
            (-9.5, 38.7), (-9.0, 43.0), (-1.5, 43.5), (-4.5, 48.3), (1.5, 50.0), (8.5, 55.0),
            (8.0, 58.0), (5.0, 62.0), (12.0, 67.0), (28.0, 71.0), (40.0, 68.0), (50.0, 68.5),
            (60.0, 70.0), (75.0, 73.0), (90.0, 74.0), (105.0, 77.5), (130.0, 72.0), (150.0, 70.0),
            (170.0, 67.0), (190.0, 66.0), (170.0, 60.0), (156.0, 51.0), (142.0, 48.0), (132.0, 43.0),
            (129.0, 35.0), (122.0, 30.0), (118.0, 24.5), (109.0, 18.2), (105.0, 10.0), (101.0, 3.0),
            (98.5, 8.0), (92.5, 21.0), (88.0, 22.0), (80.0, 13.0), (77.5, 8.5), (73.0, 19.0),
            (68.0, 24.0), (62.0, 25.0), (58.0, 23.5), (54.0, 25.0), (50.0, 28.0), (48.0, 30.0),
            (36.0, 31.0), (34.0, 35.0), (28.0, 37.0), (22.5, 38.0), (15.0, 40.0), (12.5, 44.0),
            (3.0, 43.0), (-3.0, 36.5), (-6.0, 36.0), (-9.5, 38.7)
        ],
        "north_america": [
            (-168.0, 66.0), (-162.0, 71.0), (-145.0, 70.0), (-130.0, 70.0), (-110.0, 69.0),
            (-95.0, 70.0), (-85.0, 65.0), (-80.0, 58.0), (-75.0, 62.0), (-65.0, 60.0),
            (-55.0, 52.0), (-60.0, 46.0), (-66.0, 44.0), (-71.0, 42.0), (-75.0, 35.0),
            (-80.0, 30.0), (-81.0, 25.0), (-83.0, 28.0), (-90.0, 30.0), (-97.0, 26.0),
            (-97.0, 20.0), (-92.0, 16.0), (-88.0, 16.0), (-83.0, 10.0), (-78.0, 8.0),
            (-85.0, 12.0), (-95.0, 16.0), (-105.0, 20.0), (-110.0, 28.0), (-115.0, 32.0),
            (-122.0, 37.0), (-124.0, 43.0), (-124.0, 48.0), (-130.0, 54.0), (-136.0, 58.0),
            (-150.0, 60.0), (-160.0, 56.0), (-166.0, 60.0), (-168.0, 66.0)
        ],
        "south_america": [
            (-75.0, 11.0), (-68.0, 12.0), (-60.0, 9.0), (-50.0, 0.5), (-45.0, -1.0),
            (-35.0, -5.0), (-35.0, -9.0), (-38.0, -13.0), (-40.0, -22.0), (-45.0, -24.0),
            (-50.0, -30.0), (-55.0, -35.0), (-60.0, -38.0), (-65.0, -42.0), (-67.0, -47.0),
            (-66.0, -54.0), (-71.0, -53.0), (-74.0, -48.0), (-74.0, -42.0), (-72.0, -35.0),
            (-71.0, -28.0), (-70.0, -20.0), (-76.0, -14.0), (-80.0, -5.0), (-80.0, 0.0),
            (-78.0, 7.0), (-75.0, 11.0)
        ],
        "australia": [
            (114.0, -22.0), (113.0, -26.0), (115.0, -34.0), (120.0, -34.0), (130.0, -32.0),
            (138.0, -35.0), (145.0, -38.0), (150.0, -37.0), (153.0, -28.0), (150.0, -22.0),
            (145.0, -15.0), (142.0, -11.0), (136.0, -15.0), (136.0, -12.0), (130.0, -12.0),
            (124.0, -16.0), (118.0, -20.0), (114.0, -22.0)
        ],
        "antarctica": [
            (-60.0, -65.0), (0.0, -70.0), (60.0, -68.0), (90.0, -66.0), (120.0, -66.0),
            (150.0, -69.0), (180.0, -72.0), (-150.0, -74.0), (-120.0, -73.0), (-90.0, -72.0),
            (-60.0, -65.0)
        ]
    }

    filepath = os.path.join(OUTPUT_DIR, "_world_coasts.scss")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("// Graticule Geographic Datasets: Global Continental Boundaries\n")
        f.write("// Curated polygon coordinate sequences for major terrestrial landmasses.\n\n")
        f.write('$WORLD_CONTINENTS: (\n')
        for name, coords in continents.items():
            f.write(f'  "{name}": (\n')
            for lon, lat in coords:
                f.write(f'    ("lon": {lon}, "lat": {lat}),\n')
            f.write('  ),\n')
        f.write(');\n')
    print(f"Generated {filepath}")

def generate_flight_routes():
    """Generates global flight networks with great-circle routes."""
    routes = [
        {"id": "LHR-SIN", "from": (-0.45, 51.47), "to": (103.99, 1.36), "name": "London to Singapore"},
        {"id": "JFK-CDG", "from": (-73.78, 40.64), "to": (2.55, 49.01), "name": "New York to Paris"},
        {"id": "HND-SFO", "from": (139.78, 35.55), "to": (-122.37, 37.62), "name": "Tokyo to San Francisco"},
        {"id": "DXB-JFK", "from": (55.36, 25.25), "to": (-73.78, 40.64), "name": "Dubai to New York"},
        {"id": "SYD-LAX", "from": (151.18, -33.95), "to": (-118.41, 33.94), "name": "Sydney to Los Angeles"},
        {"id": "FRA-EZE", "from": (8.57, 50.03), "to": (-58.53, -34.82), "name": "Frankfurt to Buenos Aires"},
        {"id": "CPT-DXB", "from": (18.60, -33.97), "to": (55.36, 25.25), "name": "Cape Town to Dubai"},
        {"id": "SIN-SYD", "from": (103.99, 1.36), "to": (151.18, -33.95), "name": "Singapore to Sydney"}
    ]

    filepath = os.path.join(OUTPUT_DIR, "_flight_routes.scss")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("// Graticule Geographic Datasets: Global Aviation Network\n")
        f.write("// Major intercontinental flight corridors for geodesic great-circle routing.\n\n")
        f.write('$GLOBAL_FLIGHT_ROUTES: (\n')
        for r in routes:
            f.write(f'  "{r["id"]}": (\n')
            f.write(f'    "name": "{r["name"]}",\n')
            f.write(f'    "from-lon": {r["from"][0]},\n')
            f.write(f'    "from-lat": {r["from"][1]},\n')
            f.write(f'    "to-lon": {r["to"][0]},\n')
            f.write(f'    "to-lat": {r["to"][1]}\n')
            f.write('  ),\n')
        f.write(');\n')
    print(f"Generated {filepath}")

def generate_elevation_contours():
    """Generates synthetic 2D digital elevation matrices for Marching Squares contours."""
    # 7x7 elevation matrix centered on Mount Everest region
    # Peak at 8848m, valleys down to 4000m
    rows, cols = 7, 7
    matrix = []
    for r in range(rows):
        row = []
        for c in range(cols):
            dx = (c - 3) / 3.0
            dy = (r - 3) / 3.0
            dist = math.sqrt(dx*dx + dy*dy)
            elev = 4200 + 4648 * math.exp(-2.2 * dist * dist)
            row.append(round(elev, 1))
        matrix.append(row)

    filepath = os.path.join(OUTPUT_DIR, "_elevation_contours.scss")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("// Graticule Topographic Datasets: Digital Elevation Matrix (Mount Everest)\n")
        f.write("// 7x7 digital elevation grid in meters for Marching Squares isopleth generation.\n\n")
        f.write('$EVEREST_DEM_GRID: (\n')
        for row in matrix:
            f.write(f'  ({", ".join(map(str, row))}),\n')
        f.write(');\n\n')
        f.write('$EVEREST_DEM_BOUNDS: (\n')
        f.write('  "min-x": 86.8,\n')
        f.write('  "max-x": 87.1,\n')
        f.write('  "min-y": 27.9,\n')
        f.write('  "max-y": 28.1\n')
        f.write(');\n')
    print(f"Generated {filepath}")

def generate_meteorological_field():
    """Generates scalar temperature field matrix and wind vectors."""
    rows, cols = 6, 6
    temp_grid = []
    for r in range(rows):
        lat = 60 - (r * 24)
        row = []
        for c in range(cols):
            lon = -180 + (c * 72)
            # Temperature roughly decreases with latitude, modulated by longitude
            temp = 28 * math.cos(math.radians(lat)) + 4 * math.sin(math.radians(lon))
            row.append(round(temp, 1))
        temp_grid.append(row)

    filepath = os.path.join(OUTPUT_DIR, "_meteorological_field.scss")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("// Graticule Scientific Datasets: Global Sea Surface Temperature Field\n")
        f.write("// 6x6 scalar thermal field in degrees Celsius for contour and streamline styling.\n\n")
        f.write('$GLOBAL_TEMP_GRID: (\n')
        for row in temp_grid:
            f.write(f'  ({", ".join(map(str, row))}),\n')
        f.write(');\n\n')
        f.write('$WIND_VECTOR_SAMPLES: (\n')
        f.write('  ("lon": -30, "lat": 45, "speed-knots": 48, "bearing-deg": 240, "u": 15, "v": 25),\n')
        f.write('  ("lon": 150, "lat": 35, "speed-knots": 65, "bearing-deg": 280, "u": 30, "v": 10),\n')
        f.write('  ("lon": 0, "lat": -40, "speed-knots": 55, "bearing-deg": 270, "u": 35, "v": 0),\n')
        f.write('  ("lon": -140, "lat": 15, "speed-knots": 22, "bearing-deg": 75, "u": -12, "v": -8),\n')
        f.write('  ("lon": 80, "lat": 10, "speed-knots": 18, "bearing-deg": 225, "u": 10, "v": 12)\n')
        f.write(');\n')
    print(f"Generated {filepath}")

def generate_financial_telemetry():
    """Generates realistic candlestick OHLCV financial time series."""
    # 24 periods of realistic trending stock / fx price data
    candles = []
    price = 100.0
    for t in range(1, 25):
        # Deterministic pseudo-random walk
        drift = 1.2 * math.sin(t * 0.4) + 0.3
        open_p = round(price, 2)
        change = round(drift + 1.5 * math.cos(t * 0.8), 2)
        close_p = round(open_p + change, 2)
        high_p = round(max(open_p, close_p) + abs(math.sin(t * 1.3)) * 2.5 + 0.5, 2)
        low_p = round(min(open_p, close_p) - abs(math.cos(t * 1.1)) * 2.2 - 0.4, 2)
        vol = int(10000 + abs(change) * 12000 + t * 400)
        candles.append({
            "t": t, "open": open_p, "high": high_p, "low": low_p, "close": close_p, "volume": vol
        })
        price = close_p

    filepath = os.path.join(OUTPUT_DIR, "_financial_telemetry.scss")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("// Graticule Analytical Datasets: Multi-Asset Financial OHLCV Series\n")
        f.write("// 24-period candlestick and trading volume telemetry for technical charting.\n\n")
        f.write('$FINANCIAL_OHLCV_SERIES: (\n')
        for c in candles:
            f.write(f'  ("t": {c["t"]}, "open": {c["open"]}, "high": {c["high"]}, "low": {c["low"]}, "close": {c["close"]}, "volume": {c["volume"]}),\n')
        f.write(');\n')
    print(f"Generated {filepath}")

def main():
    generate_continental_coastlines()
    generate_flight_routes()
    generate_elevation_contours()
    generate_meteorological_field()
    generate_financial_telemetry()

if __name__ == "__main__":
    main()
