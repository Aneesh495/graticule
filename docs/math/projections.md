# Graticule Mathematical Specification: Cartographic Projections

This document details the analytical equations, domain constraints, standard parameters, and inverse formulations for the cartographic projections implemented in Graticule.

All formulas use angular radians internally. Longitudes $\lambda$ and latitudes $\phi$ are normalized relative to the central meridian $\lambda_0$ and reference parallel $\phi_0$.

---

## 1. Cylindrical Family

### 1.1 Plate Carree (Equirectangular)
* Classification: Equidistant Cylindrical
* Properties: Neither conformal nor equal-area. Preserves scale along standard parallels.

$$\begin{aligned}
x &= R (\lambda - \lambda_0) \cos \phi_1 \\
y &= R (\phi - \phi_0)
\end{aligned}$$

For standard Plate Carree, $\phi_1 = 0$, simplifying to $x = R(\lambda - \lambda_0)$ and $y = R\phi$.

### 1.2 Conformal Mercator
* Classification: Conformal Cylindrical
* Properties: Conformal. Angles preserved locally. Infinite area expansion at poles.

$$\begin{aligned}
x &= R (\lambda - \lambda_0) \\
y &= R \ln \left( \tan \left( \frac{\pi}{4} + \frac{\phi}{2} \right) \right) = R \operatorname{gd}^{-1}(\phi)
\end{aligned}$$

To avoid logarithmic divergence at the poles, latitude is clamped to $\phi \in [-85.051128^\circ, +85.051128^\circ]$.

### 1.3 Web Mercator (EPSG:3857)
* Classification: Conformal Spherical Mercator on WGS-84 coordinates
* Properties: Standard projection for web tile systems (Google Maps, OpenStreetMap).

$$\begin{aligned}
x &= R (\lambda - \lambda_0) \\
y &= R \ln \left( \tan \left( \frac{\pi}{4} + \frac{\phi}{2} \right) \right)
\end{aligned}$$

Projected bounds form a square: $x, y \in [-\pi R, \pi R]$.

### 1.4 Gall-Peters Equal-Area
* Classification: Cylindrical Equal-Area with standard parallels at $\phi_1 = \pm 45^\circ$
* Properties: Equal-area ($s = 1$). Vertical elongation at equator, horizontal compression at high latitudes.

$$\begin{aligned}
x &= \frac{R (\lambda - \lambda_0)}{\sqrt{2}} \\
y &= R \sqrt{2} \sin \phi
\end{aligned}$$

### 1.5 Lambert Cylindrical Equal-Area
* Classification: Normal Cylindrical Equal-Area ($\phi_1 = 0^\circ$)
* Properties: True equal-area projection onto an equatorial tangent cylinder.

$$\begin{aligned}
x &= R (\lambda - \lambda_0) \\
y &= R \sin \phi
\end{aligned}$$

### 1.6 Miller Cylindrical
* Classification: Modified Cylindrical Compromise
* Properties: Reduces Mercator area exaggeration by scaling latitude by $4/5$ before projection.

$$\begin{aligned}
x &= R (\lambda - \lambda_0) \\
y &= \frac{5}{4} R \ln \left( \tan \left( \frac{\pi}{4} + \frac{2\phi}{5} \right) \right)
\end{aligned}$$

Pole coordinates project to $y = \pm 2.3034 R$.

### 1.7 Transverse Mercator (Gauss-Kruger)
* Classification: Transverse Conformal Cylindrical
* Properties: Conformal projection onto a cylinder tangent to a chosen central meridian.

$$\begin{aligned}
B &= \cos \phi \sin(\lambda - \lambda_0) \\
x &= \frac{1}{2} R \ln \left( \frac{1 + B}{1 - B} \right) = R \operatorname{atanh}(B) \\
y &= R \operatorname{atan2}(\tan \phi, \cos(\lambda - \lambda_0))
\end{aligned}$$

---

## 2. Conic Family

### 2.1 Lambert Conformal Conic (LCC)
* Classification: Conformal Conic
* Properties: Conformal with two standard parallels $\phi_1, \phi_2$.

$$\begin{aligned}
n &= \frac{\ln(\cos \phi_1 \sec \phi_2)}{\ln(\tan(\pi/4 + \phi_2/2) \cot(\pi/4 + \phi_1/2))} \\
F &= \frac{\cos \phi_1 \tan^n(\pi/4 + \phi_1/2)}{n} \\
\rho &= R F \cot^n\left(\frac{\pi}{4} + \frac{\phi}{2}\right) \\
\theta &= n (\lambda - \lambda_0) \\
x &= \rho \sin \theta \\
y &= \rho_0 - \rho \cos \theta
\end{aligned}$$

### 2.2 Albers Equal-Area Conic
* Classification: Equal-Area Conic
* Properties: Equal-area with two standard parallels. Used in official US and European regional atlases.

$$\begin{aligned}
n &= \frac{\sin \phi_1 + \sin \phi_2}{2} \\
C &= \cos^2 \phi_1 + 2n \sin \phi_1 \\
\rho &= \frac{R}{n} \sqrt{C - 2n \sin \phi} \\
\theta &= n (\lambda - \lambda_0) \\
x &= \rho \sin \theta \\
y &= \rho_0 - \rho \cos \theta
\end{aligned}$$

### 2.3 Equidistant Conic
* Classification: Equidistant Conic
* Properties: True scale along all meridians and standard parallels.

$$\begin{aligned}
n &= \frac{\cos \phi_1 - \cos \phi_2}{\phi_2 - \phi_1} \\
G &= \frac{\cos \phi_1}{n} + \phi_1 \\
\rho &= R (G - \phi) \\
\theta &= n (\lambda - \lambda_0) \\
x &= \rho \sin \theta \\
y &= \rho_0 - \rho \cos \theta
\end{aligned}$$

---

## 3. Azimuthal Family

For all azimuthal projections centered at $(\lambda_0, \phi_0)$, the angular distance $c$ and azimuth $A$ are defined by:

$$\begin{aligned}
\cos c &= \sin \phi_0 \sin \phi + \cos \phi_0 \cos \phi \cos(\lambda - \lambda_0) \\
k' &= f(c) \\
x &= R k' \cos \phi \sin(\lambda - \lambda_0) \\
y &= R k' (\cos \phi_0 \sin \phi - \sin \phi_0 \cos \phi \cos(\lambda - \lambda_0))
\end{aligned}$$

The scaling function $k'$ determines the specific projection:

| Projection | Scale Factor $k'$ | Horizon Limit |
|---|---|---|
| Orthographic (3D Globe) | $k' = 1$ | $c \le \pi/2$ |
| Stereographic (Conformal) | $k' = \frac{2}{1 + \cos c}$ | $c < \pi$ |
| Azimuthal Equidistant | $k' = \frac{c}{\sin c}$ | $c \le \pi$ |
| Gnomonic (Geodesic Straight Line) | $k' = \frac{1}{\cos c}$ | $c < \pi/2$ |
| Lambert Azimuthal (LAEA) | $k' = \sqrt{\frac{2}{1 + \cos c}}$ | $c \le \pi$ |

---

## 4. Pseudocylindrical Family

### 4.1 Mollweide Equal-Area
* Classification: Pseudocylindrical Equal-Area
* Properties: Elliptical outline (aspect ratio 2:1). Auxiliary parametric angle $\theta$ solved via Newton-Raphson iteration:

$$2\theta + \sin(2\theta) = \pi \sin \phi$$

Iteration step:

$$\theta_{n+1} = \theta_n - \frac{2\theta_n + \sin(2\theta_n) - \pi \sin \phi}{2 + 2\cos(2\theta_n)}$$

Coordinate assignment:

$$\begin{aligned}
x &= \frac{2\sqrt{2}}{\pi} R (\lambda - \lambda_0) \cos \theta \\
y &= \sqrt{2} R \sin \theta
\end{aligned}$$

### 4.2 Robinson
* Classification: Pseudocylindrical Compromise
* Properties: Designed by Arthur H. Robinson for the National Geographic Society. Interpolated through tabular polynomial coefficients at 5-degree latitude steps.

$$\begin{aligned}
x &= 0.8487 R (\lambda - \lambda_0) X(\phi) \\
y &= 1.3523 R Y(\phi)
\end{aligned}$$

### 4.3 Sinusoidal (Sanson-Flamsteed)
* Classification: Pseudocylindrical Equal-Area
* Properties: All parallels are standard lines. Parallels are straight; meridians are sinusoidal curves.

$$\begin{aligned}
x &= R (\lambda - \lambda_0) \cos \phi \\
y &= R \phi
\end{aligned}$$

### 4.4 Winkel Tripel (Winkel III)
* Classification: Pseudocylindrical Compromise
* Properties: Arithmetic mean of Plate Carree and Aitoff projection:

$$\begin{aligned}
\alpha &= \arccos\left(\cos \phi \cos\left(\frac{\lambda - \lambda_0}{2}\right)\right) \\
\operatorname{sinc} \alpha &= \frac{\sin \alpha}{\alpha} \\
x &= \frac{R}{2} \left( (\lambda - \lambda_0) \cos \phi_1 + \frac{2 \cos \phi \sin((\lambda - \lambda_0)/2)}{\operatorname{sinc} \alpha} \right) \\
y &= \frac{R}{2} \left( \phi + \frac{\sin \phi}{\operatorname{sinc} \alpha} \right)
\end{aligned}$$

Standard reference parallel $\phi_1 = \arccos(2/\pi) \approx 50.467^\circ$.
