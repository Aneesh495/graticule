# Graticule Developer Guide: Getting Started

This guide walks through cloning, configuring, compiling, and integrating Graticule into modern web applications and publication build pipelines.

---

## 1. Prerequisites

* Node.js v18.0.0 or higher
* npm v9.0.0 or higher
* Dart Sass v1.83.0 or higher (installed locally via `npm install`)
* Python 3.8+ (for running the verification linters and compiler benchmarks)

---

## 2. Installation & Quickstart

Clone the repository and install dev dependencies:

```bash
git clone https://github.com/Aneesh495/graticule.git
cd graticule
npm install
```

Verify all test suites and compile-time assertions:

```bash
./scripts/verify_all.sh
```

---

## 3. Command Line Interface (CLI)

Graticule includes a standalone CLI tool in `bin/graticule` for projection dispatch, stylesheet builds, and interactive showroom hosting.

### 3.1 List Supported Projections
```bash
./bin/graticule list-projections
```
Displays all 20 built-in cartographic projection identifiers with family classification and conformal/equal-area properties.

### 3.2 One-Shot Coordinate Projection
Project any decimal degree coordinate pair $(\lambda, \phi)$ in pure Sass:
```bash
./bin/graticule project -73.78 40.64 --proj=mercator
```
Output:
```json
{
  "input": { "lon": -73.78, "lat": 40.64 },
  "projection": "mercator",
  "projected": { "x": -1.2877, "y": 0.7712 }
}
```

### 3.3 Compile Production Stylesheets
```bash
./bin/graticule build
```
Compiles `scss/graticule.scss` into `dist/graticule.css` (expanded) and `dist/graticule.min.css` (compressed).

### 3.4 Launch Interactive Showroom
```bash
./bin/graticule serve 8080
```
Starts a local HTTP server serving the interactive showroom at `http://localhost:8080`.

---

## 4. Using Graticule in Your Sass Project

Add Graticule to your Sass load paths and import the library:

```scss
// my-map.scss
@use "graticule" as g;
@use "sass:map";

// 1. Project geographic coordinates at compile time
$london: g.project-point(-0.1278, 51.5074, "robinson");
$new-york: g.project-point(-74.0060, 40.7128, "robinson");

// 2. Generate geodesic flight route waypoints
$flight-waypoints: g.great-circle-path(-74.0060, 40.7128, -0.1278, 51.5074, 16);

// 3. Serialize directly into SVG path string
$flight-path-d: g.polyline-to-svg-path($flight-waypoints, false, 1);

// 4. Output CSS custom properties for responsive styling
.flight-corridor {
  --flight-path: "#{$flight-path-d}";
  --origin-x: #{map.get($new-york, "x")};
  --origin-y: #{map.get($new-york, "y")};
  --dest-x: #{map.get($london, "x")};
  --dest-y: #{map.get($london, "y")};
}
```

Compile with Dart Sass:

```bash
npx sass my-map.scss my-map.css --no-source-map
```
