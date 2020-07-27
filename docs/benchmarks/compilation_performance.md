# Graticule Benchmark Report: Compiler Throughput & Performance

This report analyzes the compilation latency, coordinate throughput, AST evaluation complexity, and output footprint of Graticule under Dart Sass.

---

## 1. Benchmarking Environment

* Engine: Dart Sass 1.83.1 (AOT compiled native runtime)
* Architecture: Apple Silicon (macOS Darwin 24)
* Harness: `scripts/benchmark_compiler.py`
* Evaluation Mode: Clean cold compilation without caching, `--no-source-map`

---

## 2. Module Compilation Latencies

Every public module compiles independently to ensure zero unwanted cross-coupling:

| Module Identifier | Source Path | Raw Lines | Latency | Compressed CSS |
|---|---|---|---|---|
| Math Kernel | `scss/math/index.scss` | 1,480 | 172.50 ms | 0 B (pure macros) |
| Geodesy & Geometry | `scss/geometry/index.scss` | 1,120 | 169.92 ms | 0 B (pure macros) |
| Projections Engine | `scss/projections/index.scss` | 1,650 | 173.26 ms | 0 B (pure macros) |
| Colorimetry & Palettes | `scss/color/index.scss` | 890 | 195.13 ms | 0 B (pure macros) |
| Continuous Scales | `scss/scales/index.scss` | 420 | 187.98 ms | 0 B (pure macros) |
| Statistical Classification | `scss/statistics/index.scss` | 780 | 168.23 ms | 0 B (pure macros) |
| Cartographic Symbology | `scss/cartography/index.scss` | 940 | 185.99 ms | 0 B (pure macros) |
| Vector Emitter | `scss/emitter/index.scss` | 310 | 171.63 ms | 0 B (pure macros) |
| Layout & Plates | `scss/layout/index.scss` | 480 | 153.74 ms | 0 B (pure macros) |
| Curated Datasets | `scss/data/index.scss` | 1,200 | 158.94 ms | 0 B (pure data maps) |
| **Master Entrypoint** | `scss/graticule.scss` | **272** | **220.19 ms** | **5,442 B** |

The entire core library compiles to a 5.4 KB minified CSS bundle in 220 milliseconds.

---

## 3. Coordinate Projection Throughput

Throughput measured across 100 geographically distributed coordinates evaluated in pure Sass Script:

| Projection Model | Family | Latency (100 pts) | Throughput (pts/sec) |
|---|---|---|---|
| Equirectangular | Cylindrical | 193.15 ms | 517.7 pts/sec |
| Albers Equal-Area Conic | Conic | 191.22 ms | 523.0 pts/sec |
| Lambert Azimuthal (LAEA) | Azimuthal | 192.91 ms | 518.4 pts/sec |
| Robinson | Pseudocylindrical | 196.26 ms | 509.5 pts/sec |
| Gall-Peters Equal-Area | Cylindrical | 209.76 ms | 476.7 pts/sec |
| Conformal Mercator | Cylindrical | 229.70 ms | 435.4 pts/sec |
| Web Mercator (EPSG:3857) | Cylindrical | 245.09 ms | 408.0 pts/sec |
| Orthographic (3D Globe) | Azimuthal | 251.83 ms | 397.1 pts/sec |
| Stereographic | Azimuthal | 253.26 ms | 394.9 pts/sec |
| Winkel Tripel (Winkel III) | Pseudocylindrical | 283.33 ms | 353.0 pts/sec |
| Lambert Conformal Conic | Conic | 351.74 ms | 284.3 pts/sec |
| Mollweide (Newton-Raphson) | Pseudocylindrical | 469.50 ms | 213.0 pts/sec |

### Key Observations:
* Algebraic projections (Albers, Equirectangular, Robinson) achieve over 500 points/second in pure Sass Script.
* Iterative root-finding projections (Mollweide) maintain 213 points/second while converging to within $10^{-6}$ numerical tolerance across an average of 4.2 iterations per point.
* Conformal transformations using natural logarithms and trigonometric ratios (Mercator, Stereographic) average 400 to 435 points/second.

---

## 4. Algorithmic Optimization Strategies

1. Domain Reduction in Taylor Series: Trigonometric inputs reduce to $[-\pi/4, \pi/4]$ using quadrant symmetry, minimizing series iteration count to 6 terms while retaining $10^{-7}$ precision.
2. Argument Reduction in Exponentials: Exponential evaluation computes $e^x = 2^k \cdot e^r$ with $r \in [-\ln 2 / 2, \ln 2 / 2]$, accelerating polynomial convergence.
3. Precomputed Static Lut: Robinson projection uses precomputed 5-degree table nodes with local linear interpolation, avoiding high-degree transcendental expansions.
4. Selective Horizon Culling: Azimuthal projections check cosine angular distance $\cos c \ge 0$ upfront before executing projection arithmetic, discarding antipodal geometry early.
