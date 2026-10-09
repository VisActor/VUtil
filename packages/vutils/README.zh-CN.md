## 标准正态逆 CDF

```ts
import { normalQuantile } from '@visactor/vutils';
normalQuantile(0.975); // 约 1.95996398454
```

`normalQuantile(p)` 复用回归区间原有的 Acklam 近似。p 在 (0,1) 返回有限分位数，0 / 1 返回 −Infinity / Infinity，非法概率或非有限输入返回 NaN。SciPy 1.13.1 基准检查尾部 1e-12 至 1−1e-12 和分段边界，绝对误差小于 5e-8。回归区间也调用此工具，避免维护重复实现。
