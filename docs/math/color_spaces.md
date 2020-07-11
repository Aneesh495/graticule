# Graticule Mathematical Specification: Perceptual Colorimetry

This document details the color transformations, perceptual spaces, scientific colormap interpolation, and accessibility metrics implemented in Graticule.

---

## 1. sRGB Transfer Functions & CIE XYZ

The sRGB color space uses a piecewise non-linear electro-optical transfer function (gamma companding). Conversion from normalized sRGB $[0, 1]$ to linear radiometric intensity $C_{\text{lin}}$:

$$C_{\text{lin}} = \begin{cases}
\frac{C_{\text{sRGB}}}{12.92} & \text{if } C_{\text{sRGB}} \le 0.04045 \\
\left( \frac{C_{\text{sRGB}} + 0.055}{1.055} \right)^{2.4} & \text{if } C_{\text{sRGB}} > 0.04045
\end{cases}$$

Linear RGB transforms to CIE 1931 XYZ using the D65 standard illuminant reference matrix:

$$\begin{bmatrix} X \\ Y \\ Z \end{bmatrix} = \begin{bmatrix}
0.4124564 & 0.3575761 & 0.1804375 \\
0.2126729 & 0.7151522 & 0.0721750 \\
0.0193339 & 0.1191920 & 0.9503041
\end{bmatrix} \begin{bmatrix} R_{\text{lin}} \\ G_{\text{lin}} \\ B_{\text{lin}} \end{bmatrix}$$

---

## 2. Bjorn Ottosson's OKLab Color Space

Standard CIELAB suffers from hue linearity errors, particularly in the blue-purple gamut where perceptual hue shifts as chroma increases. Graticule implements the OKLab color model to achieve true perceptual linearity:

### 2.1 Forward Transform: Linear RGB to OKLab
1. Convert Linear RGB to approximate human cone responses (LMS):

$$\begin{bmatrix} L \\ M \\ S \end{bmatrix} = \begin{bmatrix}
0.4122214708 & 0.5363325363 & 0.0514459929 \\
0.2119034982 & 0.6806995451 & 0.1073969566 \\
0.0883024619 & 0.2817188376 & 0.6299787005
\end{bmatrix} \begin{bmatrix} R_{\text{lin}} \\ G_{\text{lin}} \\ B_{\text{lin}} \end{bmatrix}$$

2. Apply cube-root non-linearity (evaluated via Newton-Raphson in pure Sass):

$$L' = \sqrt[3]{L}, \quad M' = \sqrt[3]{M}, \quad S' = \sqrt[3]{S}$$

3. Rotate into OKLab coordinates $(L, a, b)$:

$$\begin{bmatrix} L_{\text{ok}} \\ a_{\text{ok}} \\ b_{\text{ok}} \end{bmatrix} = \begin{bmatrix}
0.2104542553 & 0.7936177850 & -0.0040720404 \\
1.9779984951 & -2.4285922050 & 0.4505937099 \\
0.0259040371 & 0.7827717662 & -0.8086757660
\end{bmatrix} \begin{bmatrix} L' \\ M' \\ S' \end{bmatrix}$$

### 2.2 Polar OKLCh Coordinates
Cylindrical representation with chroma $C$ and hue angle $h$:

$$\begin{aligned}
C &= \sqrt{a_{\text{ok}}^2 + b_{\text{ok}}^2} \\
h &= \operatorname{atan2}(b_{\text{ok}}, a_{\text{ok}}) \cdot \left(\frac{180^\circ}{\pi}\right)
\end{aligned}$$

---

## 3. Continuous Perceptual Colormap Sampling

Color palette interpolation in traditional RGB generates desaturated mud zones and non-monotonic lightness curves. Graticule performs linear interpolation in OKLab space:

$$\mathbf{C}(t) = (1 - t) \mathbf{C}_{\text{start}}^{\text{ok}} + t \mathbf{C}_{\text{end}}^{\text{ok}}$$

The interpolated point is mapped back to sRGB and clamped to $[0, 255]$ gamuts. This powers Graticule's 9 built-in 256-stop scientific colormaps:
* Sequential: Viridis, Plasma, Magma, Inferno, Cividis
* Rainbow/Spectral: Turbo
* Diverging: Coolwarm
* Domain Specific: Bathymetric (deep ocean blue to shallow cyan) and Topographic (coastal green to alpine snow)

---

## 4. Accessibility & Contrast Metrics

### 4.1 WCAG 2.1 Relative Luminance & Contrast
Relative luminance $Y$ uses the standard photometric weights:

$$Y = 0.2126729 R_{\text{lin}} + 0.7151522 G_{\text{lin}} + 0.0721750 B_{\text{lin}}$$

Contrast ratio $CR$ between lighter color $L_1$ and darker color $L_2$:

$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$

* WCAG AA Normal Text: $CR \ge 4.5:1$
* WCAG AA Large Text / UI Components: $CR \ge 3.0:1$
* WCAG AAA Normal Text: $CR \ge 7.0:1$

### 4.2 Machado Color Vision Deficiency (CVD) Simulation
Graticule simulates physiological photoreceptor anomalies by multiplying linear RGB vectors by Machado spectral projection matrices:

$$\mathbf{C}_{\text{sim}} = \mathbf{M}_{\text{cvd}} \mathbf{C}_{\text{lin}}$$

Supported conditions: Protanopia (L-cone absence), Deuteranopia (M-cone absence), Tritanopia (S-cone absence), and Achromatopsia (monochromacy).
