#!/usr/bin/env python3

"""
Graticule Sass Compiler Performance & Ast Metrics Benchmarking Suite.
Measures compilation throughput, evaluation latency across projection families,
and memory/output footprint under Dart Sass.
"""

import json
import os
import subprocess
import time
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SASS_BIN = os.path.join(ROOT_DIR, "node_modules", ".bin", "sass")

MODULES = [
    ("Math Kernel", "scss/math/index.scss"),
    ("Geodesy & Geometry", "scss/geometry/index.scss"),
    ("Projections Engine", "scss/projections/index.scss"),
    ("Colorimetry & Palettes", "scss/color/index.scss"),
    ("Continuous Scales", "scss/scales/index.scss"),
    ("Statistical Classification", "scss/statistics/index.scss"),
    ("Cartographic Symbology", "scss/cartography/index.scss"),
    ("Vector Emitter", "scss/emitter/index.scss"),
    ("Layout & Plates", "scss/layout/index.scss"),
    ("Curated Datasets", "scss/data/index.scss"),
    ("Master Entrypoint", "scss/graticule.scss"),
]

PROJECTION_BENCHMARKS = [
    ("Equirectangular (Plate Carree)", "equirectangular"),
    ("Conformal Mercator", "mercator"),
    ("Web Mercator (EPSG:3857)", "web-mercator"),
    ("Gall-Peters Equal-Area", "gall-peters"),
    ("Lambert Conformal Conic", "lambert-conformal-conic"),
    ("Albers Equal-Area Conic", "albers-conic"),
    ("Orthographic Azimuthal", "orthographic"),
    ("Stereographic Azimuthal", "stereographic"),
    ("Lambert Azimuthal Equal-Area", "lambert-azimuthal"),
    ("Robinson Pseudocylindrical", "robinson"),
    ("Mollweide Homolographic", "mollweide"),
    ("Winkel Tripel (Winkel III)", "winkel-tripel"),
]

def benchmark_modules():
    results = []
    print("\nBenchmarking Module Compilation Speeds:")
    print("-" * 65)
    print(f"{'Module':<30} {'Lines':<8} {'Compile Time':<15} {'CSS Size'}")
    print("-" * 65)

    for name, rel_path in MODULES:
        full_path = os.path.join(ROOT_DIR, rel_path)
        with open(full_path, "r", encoding="utf-8") as f:
            lines = len(f.readlines())

        start = time.perf_counter()
        proc = subprocess.run(
            [SASS_BIN, "--no-source-map", "--style=compressed", full_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=ROOT_DIR,
        )
        elapsed_ms = (time.perf_counter() - start) * 1000.0

        if proc.returncode != 0:
            print(f"Error compiling {name}: {proc.stderr.decode()}")
            sys.exit(1)

        css_bytes = len(proc.stdout)
        results.append({
            "module": name,
            "path": rel_path,
            "lines": lines,
            "time_ms": elapsed_ms,
            "css_bytes": css_bytes,
        })
        print(f"{name:<30} {lines:<8} {elapsed_ms:>8.2f} ms     {css_bytes:>6} B")

    print("-" * 65)
    return results

def benchmark_projections():
    print("\nBenchmarking 100-Coordinate Projection Throughput in Pure Sass:")
    print("-" * 65)
    print(f"{'Projection':<35} {'Compile Time':<15} {'Rate (pts/sec)'}")
    print("-" * 65)

    results = []
    tmp_scss = os.path.join(ROOT_DIR, ".tmp_proj_bench.scss")

    for name, proj_id in PROJECTION_BENCHMARKS:
        # Generate 100 test coordinates spread over world grid
        scss_content = f"""
        @use "scss/projections" as p;
        @use "sass:list";
        $results: ();
        @for $i from 1 through 100 {{
          $lon: -180 + ($i * 3.6);
          $lat: -80 + ($i * 1.6);
          $pt: p.project-point($lon, $lat, "{proj_id}");
          $results: list.append($results, $pt);
        }}
        .benchmark-result {{
          --points-count: #{{list.length($results)}};
        }}
        """
        with open(tmp_scss, "w", encoding="utf-8") as f:
            f.write(scss_content)

        start = time.perf_counter()
        proc = subprocess.run(
            [SASS_BIN, "--no-source-map", tmp_scss],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=ROOT_DIR,
        )
        elapsed_ms = (time.perf_counter() - start) * 1000.0

        if proc.returncode != 0:
            print(f"Error compiling projection benchmark {name}: {proc.stderr.decode()}")
            sys.exit(1)

        rate = (100.0 / (elapsed_ms / 1000.0))
        results.append({
            "projection": name,
            "id": proj_id,
            "time_ms": elapsed_ms,
            "points_per_sec": rate,
        })
        print(f"{name:<35} {elapsed_ms:>8.2f} ms     {rate:>10.1f}")

    if os.path.exists(tmp_scss):
        os.remove(tmp_scss)

    print("-" * 65)
    return results

def main():
    mod_results = benchmark_modules()
    proj_results = benchmark_projections()

    out_file = os.path.join(ROOT_DIR, "docs", "benchmarks", "benchmark_results.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "modules": mod_results,
            "projections": proj_results,
        }, f, indent=2)

    print(f"\nBenchmark results saved to {os.path.relpath(out_file, ROOT_DIR)}\n")

if __name__ == "__main__":
    main()
