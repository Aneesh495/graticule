# Graticule Developer Guide: Authoring Custom Projections

This guide explains how to implement, register, and verify custom cartographic projections within Graticule's pure Sass architecture.

---

## 1. Mathematical Blueprint

Every projection in Graticule requires two pure functions:
1. Forward Projection: Maps longitude and latitude $(\lambda, \phi)$ in degrees to dimensionless Cartesian coordinates $(x, y)$.
2. Inverse Projection: Maps Cartesian $(x, y)$ back to geographic coordinates $(\lambda, \phi)$ in degrees.

### Return Map Structure
A forward projection must return a Sass map with three keys:
```scss
(
  "x": 1.4523,       // Dimensionless Cartesian horizontal displacement
  "y": -0.8214,      // Dimensionless Cartesian vertical displacement
  "visible": true    // Boolean flag (false if culled behind horizon)
)
```

---

## 2. Walkthrough: Implementing the Behrmann Equal-Area Projection

The Behrmann projection is an equal-area cylindrical projection with standard parallels at $\phi_1 = \pm 30^\circ$.

### Mathematical Formulation:
$$\begin{aligned}
x &= R (\lambda - \lambda_0) \cos(30^\circ) = \frac{\sqrt{3}}{2} (\lambda - \lambda_0) \\
y &= \frac{R \sin \phi}{\cos(30^\circ)} = \frac{2}{\sqrt{3}} \sin \phi
\end{aligned}$$

### Implementation in Sass:
Create a new file or add to `scss/projections/_cylindrical.scss`:

```scss
@use "../math" as m;
@use "sass:math";

/// Projects coordinates using the Behrmann Equal-Area Cylindrical projection.
/// @param {Number} $lon - Longitude in degrees [-180, 180]
/// @param {Number} $lat - Latitude in degrees [-90, 90]
/// @param {Number} $lon0 - Central meridian in degrees
/// @return {Map} Projected Cartesian point (x, y, visible)
@function project-behrmann($lon, $lat, $lon0: 0) {
  $rad-lon: m.deg-to-rad($lon - $lon0);
  $rad-lat: m.deg-to-rad($lat);

  // cos(30 deg) = sqrt(3)/2 ~ 0.8660254
  $cos-phi1: 0.8660254;

  $x: $rad-lon * $cos-phi1;
  $y: math.div(m.sin($rad-lat), $cos-phi1);

  @return (
    "x": $x,
    "y": $y,
    "visible": true
  );
}

/// Inverts Cartesian coordinates back to Behrmann geographic coordinates.
@function unproject-behrmann($x, $y, $lon0: 0) {
  $cos-phi1: 0.8660254;
  $rad-lon: math.div($x, $cos-phi1);
  $sin-lat: $y * $cos-phi1;

  $rad-lat: m.asin($sin-lat);

  @return (
    "lon": m.rad-to-deg($rad-lon) + $lon0,
    "lat": m.rad-to-deg($rad-lat)
  );
}
```

---

## 3. Registering the Projection

Register metadata and dispatch branches in `scss/projections/_registry.scss`:

### 3.1 Metadata Map Entry
```scss
$_PROJECTION_METADATA: (
  // ... existing projections ...
  "behrmann": (
    "name": "Behrmann Equal-Area Cylindrical",
    "family": "cylindrical",
    "aspect-ratio": 2.36,
    "conformal": false,
    "equal-area": true,
    "compromise": false
  )
);
```

### 3.2 Dispatch Branch
In `project-point($lon, $lat, $name)`:
```scss
@if $name == "behrmann" {
  @return cyl.project-behrmann($lon, $lat);
}
```

---

## 4. Writing Unit Tests

Add a round-trip precision verification assertion in `test/unit/projections_test.scss`:

```scss
// Test forward projection at (0, 30)
$pt-behrmann: p.project-point(0, 30, "behrmann");
@include assert-equal("Behrmann forward Y", map.get($pt-behrmann, "y"), 0.57735, 0.001);

// Test inverse projection round-trip
$orig: p.unproject-point(map.get($pt-behrmann, "x"), map.get($pt-behrmann, "y"), "behrmann");
@include assert-equal("Behrmann inverse Lat", map.get($orig, "lat"), 30, 0.01);
```

Run tests to verify:
```bash
./test/run_all_tests.js
```
