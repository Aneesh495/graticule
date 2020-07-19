# Graticule Mathematical Specification: Statistical Classification & Density Estimation

This specification describes the univariate data classification algorithms, dynamic programming optimizers, and non-parametric density estimation implemented in Graticule.

---

## 1. Fisher-Jenks Natural Breaks Optimization

The Fisher-Jenks algorithm computes optimal class boundaries for choropleth mapping by minimizing within-class variance while maximizing between-class variance.

### 1.1 Objective Formulation
Given an ordered array of $N$ observations $x_1 \le x_2 \le \dots \le x_N$ partitioned into $K$ classes:

$$\text{SDCM} = \sum_{k=1}^K \sum_{i \in C_k} (x_i - \bar{x}_{C_k})^2$$

Where $\text{SDCM}$ is the Sum of Squared Deviations from Class Means, and $\bar{x}_{C_k}$ is the arithmetic mean of class $k$. The algorithm maximizes the Goodness of Variance Fit ($\text{GVF}$):

$$\text{GVF} = 1 - \frac{\text{SDCM}}{\text{SDAM}}$$

Where $\text{SDAM}$ is the Sum of Squared Deviations from the Array Mean:

$$\text{SDAM} = \sum_{i=1}^N (x_i - \bar{x}_{\text{total}})^2$$

### 1.2 Dynamic Programming Recurrence in Pure Sass
Graticule computes the global optimum using dynamic programming tables:
1. Variance Table $V[i, j]$: Stores the sum of squared deviations for sub-array $x_i \dots x_j$:

$$V[i, j] = \sum_{m=i}^j x_m^2 - \frac{1}{j - i + 1} \left( \sum_{m=i}^j x_m \right)^2$$

2. Recurrence Table $D[k, j]$: Minimal variance achievable partitioning the prefix $x_1 \dots x_j$ into $k$ classes:

$$D[k, j] = \min_{k \le i \le j} \left( D[k-1, i-1] + V[i, j] \right)$$

3. Backtracking: Traverses the decision index matrix $P[k, j]$ backward from $j = N$ down to $k = 1$ to reconstruct class boundary indices.

---

## 2. John W. Tukey's Five-Number Summary & Outlier Fences

For analytical box-and-whisker plots, Graticule evaluates Tukey's robust order statistics:
* Minimum: Smallest non-outlier observation
* Lower Quartile ($Q_1$): 25th percentile
* Median ($Q_2$): 50th percentile
* Upper Quartile ($Q_3$): 75th percentile
* Maximum: Largest non-outlier observation

### Outlier Fences
The Interquartile Range ($IQR$):

$$IQR = Q_3 - Q_1$$

Data points outside the inner fences are classified as mild outliers:

$$\text{Inner Fences} = [Q_1 - 1.5 \cdot IQR, \; Q_3 + 1.5 \cdot IQR]$$

Points outside the outer fences are classified as extreme outliers:

$$\text{Outer Fences} = [Q_1 - 3.0 \cdot IQR, \; Q_3 + 3.0 \cdot IQR]$$

Whiskers terminate at the adjacent values (the extreme data observations strictly inside the inner fences).

---

## 3. Kernel Density Estimation (KDE)

For violin plots and continuous density overlays, Graticule implements univariate Kernel Density Estimation:

$$\hat{f}(x) = \frac{1}{n h} \sum_{i=1}^n K\left( \frac{x - x_i}{h} \right)$$

Where $K(u)$ is the kernel function and $h$ is the smoothing bandwidth parameter.

### 3.1 Kernel Functions
* Standard Gaussian Kernel:

$$K(u) = \frac{1}{\sqrt{2\pi}} \exp\left(-\frac{u^2}{2}\right)$$

* Epanechnikov Parabolic Kernel (optimal in the mean-square error sense):

$$K(u) = \begin{cases}
\frac{3}{4}(1 - u^2) & \text{if } |u| \le 1 \\
0 & \text{otherwise}
\end{cases}$$

### 3.2 Silverman's Rule-of-Thumb Bandwidth Selection
Graticule computes an optimal bandwidth $h$ adaptive to data dispersion and sample size $n$:

$$A = \min\left( \hat{\sigma}, \; \frac{IQR}{1.34} \right)$$

$$h_{\text{opt}} = 0.9 \cdot A \cdot n^{-1/5}$$

Where $\hat{\sigma}$ is the sample standard deviation. This prevents over-smoothing on multimodal distributions.

---

## 4. Flannery Perceptual Area Scaling

Human visual perception systematically underestimates the relative size of large circular thematic map symbols. James J. Flannery demonstrated that perceived area follows a power-law exponent:

$$\text{Area}_{\text{perceived}} \propto r^{1.75}$$

To compensate and produce correct perceived visual ratios, Graticule scales symbol radii according to Flannery's perceptual compensation constant:

$$r = R_{\max} \cdot \left( \frac{V - V_{\min}}{V_{\max} - V_{\min}} \right)^{0.5716}$$

Where exponent $0.5716 \approx 1 / 1.75$.
