# Graticule Technical Specification: Cartographic Symbology & Meteorological Encoding

This specification defines the visual symbology standards, grid alignment mathematics, meteorological vector encoding, and scalar contour extraction implemented in Graticule.

---

## 1. Graticule Wireframe Mathematics & Convergence

A cartographic graticule represents the coordinate network of parallels (lines of constant latitude $\phi$) and meridians (lines of constant longitude $\lambda$).

### 1.1 Grid Convergence Angle
On any non-cylindrical map projection, projected meridians converge toward the geographic poles rather than remaining parallel to the vertical grid axis. The convergence angle $\gamma$ represents the angular deflection between grid North and true geographic North:

$$\gamma = \operatorname{atan2}\left( \tan(\lambda - \lambda_0) \sin \phi, \; 1 \right)$$

For Lambert Conformal Conic and Albers Conic projections with cone constant $n$:

$$\gamma = n (\lambda - \lambda_0)$$

Graticule computes this deflection angle dynamically in pure Sass to align north-seeking compass rosettes and directional labels accurately.

### 1.2 Adaptive Angular Spacing
Graticule adjusts graticule density dynamically based on viewport extent and map scale:

| Map Extent (Degrees) | Major Step | Minor Subdivision | Label Format |
|---|---|---|---|
| Global ($> 90^\circ$) | $30^\circ$ | $10^\circ$ | Integer degrees ($30^\circ\text{ N}$) |
| Continental ($30^\circ - 90^\circ$) | $10^\circ$ | $2^\circ$ | Integer degrees ($40^\circ\text{ N}$) |
| Regional ($5^\circ - 30^\circ$) | $2^\circ$ | $30'$ | Degrees + minutes ($42^\circ 30'\text{ N}$) |
| Local ($< 5^\circ$) | $30'$ | $5'$ | Full DMS format ($42^\circ 15' 30''\text{ N}$) |

---

## 2. World Meteorological Organization (WMO) Wind Barbs

Graticule renders official WMO-compliant vector wind barbs representing wind speed and direction:

### 2.1 Staff Vector Alignment
The base staff extends from station coordinates $(x_0, y_0)$ in the direction from which the wind blows (meteorological azimuth $\theta_w$):

$$\begin{aligned}
x_{\text{end}} &= x_0 + L \sin(\theta_w) \\
y_{\text{end}} &= y_0 - L \cos(\theta_w)
\end{aligned}$$

Where $L$ is staff length (typically 24 to 32 pixels).

### 2.2 Barb Hierarchies (in Knots)
Speed is decomposed into additive visual tokens ordered from staff tip toward station base:
1. Pennant (Flag): 50 knots (solid isosceles triangle)
2. Full Barb: 10 knots (straight line segment angled at $120^\circ$ relative to the staff)
3. Half Barb: 5 knots (line segment at half length)
4. Calm Wind ($< 1$ knot): Concentric dual circles around the observation station

In the Northern Hemisphere, barbs point to the left of the staff when looking downwind; in the Southern Hemisphere, barbs point to the right.

---

## 3. Marching Squares Scalar Field Contour Extraction

Graticule extracts continuous elevation isohypses and meteorological isotherms from discrete 2D matrix arrays directly inside the Sass compiler.

### 3.1 Cell Binarization & 16-State Lookup
For each $2 \times 2$ scalar sub-grid with corners $(v_{00}, v_{10}, v_{11}, v_{01})$ evaluated against isovalue $T$:

$$\text{Index} = \mathbf{1}(v_{00} \ge T) \cdot 8 + \mathbf{1}(v_{10} \ge T) \cdot 4 + \mathbf{1}(v_{11} \ge T) \cdot 2 + \mathbf{1}(v_{01} \ge T) \cdot 1$$

Where $\mathbf{1}(\cdot)$ is the binary indicator function. The 4-bit index corresponds to one of 16 topological configurations.

### 3.2 Linear Edge Interpolation
To produce smooth vector paths rather than crude block boundaries, edge intersection positions are linearly interpolated:

$$t = \frac{T - v_A}{v_B - v_A}$$

$$\mathbf{P}_{\text{edge}} = (1 - t) \mathbf{P}_A + t \mathbf{P}_B$$

Ambiguous saddle states (indices 5 and 10) are resolved using asymptotic decider logic evaluating the average cell center scalar:

$$v_{\text{center}} = \frac{v_{00} + v_{10} + v_{11} + v_{01}}{4}$$

Extracted contour segments are assembled into continuous SVG polylines and closed polygons.
