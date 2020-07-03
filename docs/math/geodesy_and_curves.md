# Graticule Mathematical Specification: Geodesy & Parametric Curves

This specification details the mathematical formulations for terrestrial geodesy and parametric curve generation implemented in Graticule.

---

## 1. Terrestrial Ellipsoidal Parameters

Graticule incorporates the World Geodetic System 1984 (WGS-84) reference ellipsoid standards:

$$\begin{aligned}
a &= 6378137.0 \text{ m} \quad &\text{(Equatorial semi-major axis)} \\
b &= 6356752.314245 \text{ m} \quad &\text{(Polar semi-minor axis)} \\
f &= \frac{a - b}{a} = \frac{1}{298.257223563} \quad &\text{(Flattening)} \\
e^2 &= 2f - f^2 \approx 0.00669437999014 \quad &\text{(First eccentricity squared)} \\
R_{\text{mean}} &= \frac{2a + b}{3} \approx 6371008.8 \text{ m} \quad &\text{(IUGG Mean radius)}
\end{aligned}$$

---

## 2. Spherical Geodesy

### 2.1 Haversine Distance
The Haversine formula computes great-circle distance between two spherical points $(\lambda_1, \phi_1)$ and $(\lambda_2, \phi_2)$ with robust numerical stability near antipodal extremes:

$$\begin{aligned}
\Delta\phi &= \phi_2 - \phi_1 \\
\Delta\lambda &= \lambda_2 - \lambda_1 \\
h &= \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta\lambda}{2}\right) \\
c &= 2 \operatorname{atan2}(\sqrt{h}, \sqrt{1 - h}) \\
d &= R_{\text{mean}} \cdot c
\end{aligned}$$

### 2.2 Initial Great-Circle Bearing
The forward azimuth $\alpha$ from point 1 to point 2:

$$\alpha = \operatorname{atan2}(\sin \Delta\lambda \cos \phi_2, \cos \phi_1 \sin \phi_2 - \sin \phi_1 \cos \phi_2 \cos \Delta\lambda)$$

The result is normalized to the compass azimuth range $[0^\circ, 360^\circ)$.

### 2.3 Great-Circle Waypoints via SLERP
Interpolating a position along the great circle at fractional distance $f \in [0, 1]$ uses unit Cartesian 3-vector spherical linear interpolation (SLERP):

$$\mathbf{p}(f) = \frac{\sin((1-f)c)}{\sin c} \mathbf{v}_1 + \frac{\sin(f c)}{\sin c} \mathbf{v}_2$$

Where $\mathbf{v}_i = (\cos \phi_i \cos \lambda_i, \cos \phi_i \sin \lambda_i, \sin \phi_i)^T$.

---

## 3. Ellipsoidal Geodesy: Vincenty Inverse Formulation

Vincenty's inverse method evaluates geodesic distance on an oblate spheroid by modeling the geodesic as a spatial curve on the ellipsoid:

1. Reduced latitudes $U_1, U_2$:

$$\tan U_1 = (1 - f) \tan \phi_1, \quad \tan U_2 = (1 - f) \tan \phi_2$$

2. Iterative loop for difference in longitude $\Lambda$, initialized to $L = \lambda_2 - \lambda_1$:

$$\begin{aligned}
\sin \sigma &= \sqrt{(\cos U_2 \sin \Lambda)^2 + (\cos U_1 \sin U_2 - \sin U_1 \cos U_2 \cos \Lambda)^2} \\
\cos \sigma &= \sin U_1 \sin U_2 + \cos U_1 \cos U_2 \cos \Lambda \\
\sigma &= \operatorname{atan2}(\sin \sigma, \cos \sigma) \\
\sin \alpha &= \frac{\cos U_1 \cos U_2 \sin \Lambda}{\sin \sigma} \\
\cos^2 \alpha &= 1 - \sin^2 \alpha \\
\cos(2\sigma_m) &= \cos \sigma - \frac{2 \sin U_1 \sin U_2}{\cos^2 \alpha} \\
C &= \frac{f}{16} \cos^2 \alpha [4 + f(4 - 3 \cos^2 \alpha)] \\
\Lambda' &= L + (1 - C) f \sin \alpha \left[ \sigma + C \sin \sigma \left( \cos(2\sigma_m) + C \cos \sigma (-1 + 2 \cos^2(2\sigma_m)) \right) \right]
\end{aligned}$$

The iteration repeats until $|\Lambda - \Lambda'| < 10^{-12}$ (typically within 4 to 6 iterations).

3. Geodesic distance calculation:

$$\begin{aligned}
u^2 &= \cos^2 \alpha \left( \frac{a^2 - b^2}{b^2} \right) \\
A &= 1 + \frac{u^2}{16384} \left( 4096 + u^2 (-768 + u^2(320 - 175 u^2)) \right) \\
B &= \frac{u^2}{1024} \left( 256 + u^2 (-128 + u^2(74 - 47 u^2)) \right) \\
\Delta\sigma &= B \sin \sigma \left[ \cos(2\sigma_m) + \frac{B}{4} \left( \cos \sigma (-1 + 2\cos^2(2\sigma_m)) - \frac{B}{6}\cos(2\sigma_m)(-3 + 4\sin^2\sigma)(-3 + 4\cos^2(2\sigma_m)) \right) \right] \\
s &= b A (\sigma - \Delta\sigma)
\end{aligned}$$

---

## 4. Parametric Splines & Numerical Quadrature

### 4.1 Cubic Bezier Evaluation
A cubic Bezier curve with control points $\mathbf{P}_0, \mathbf{P}_1, \mathbf{P}_2, \mathbf{P}_3$ is evaluated for $t \in [0, 1]$:

$$\mathbf{B}(t) = (1-t)^3 \mathbf{P}_0 + 3(1-t)^2 t \mathbf{P}_1 + 3(1-t) t^2 \mathbf{P}_2 + t^3 \mathbf{P}_3$$

The first derivative vector:

$$\mathbf{B}'(t) = 3(1-t)^2 (\mathbf{P}_1 - \mathbf{P}_0) + 6(1-t)t (\mathbf{P}_2 - \mathbf{P}_1) + 3t^2 (\mathbf{P}_3 - \mathbf{P}_2)$$

### 4.2 Arc-Length via Simpson's Numerical Quadrature
Arc length $L$ over $[0, 1]$ is evaluated using composite Simpson's 3/8 rule:

$$L = \int_0^1 \|\mathbf{B}'(t)\| dt \approx \frac{\Delta t}{3} \sum_{i=0}^n w_i \|\mathbf{B}'(t_i)\|$$

Where $w = [1, 4, 2, 4, \dots, 2, 4, 1]$ and $n = 16$. This provides sub-pixel curve measurement directly inside Sass.
