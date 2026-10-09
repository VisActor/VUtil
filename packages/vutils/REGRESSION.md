# 一元回归与成对 bootstrap 契约

本轮修正面向 VUtil 1.0.25 的回归工具；正式 npm 1.0.25 不包含这些修复和新 API。

- regressionLinear：使用中心化/缩放的一元 OLS，预测在稳定坐标中求值，保留 coef.a/b。增加 rank；常量 x 的历史常数估计继续有定义，图表需要可识别斜率时由输入边界拒绝。
- regressionPolynomial：以归一化设计矩阵做增量 Givens QR；秩不足时对小型 R 做 Jacobi SVD 得到最小范数解，增加 rank，不再返回伪造零系数。coef 保持升幂的原始 x 坐标含义，predict 用稳定基底。degree 为非负整数，默认仍为 0。原始系数不能有限表示时明确报 RangeError。
- regressionLowess：默认 span 从 0.3 改为 2/3、iterations 从 2 改为 3，使用全部有效观测；不再隐藏抽样或按 N 关闭稳健迭代。拟合时固定稳健状态，predict/evaluateGrid/fitted 节点一致。显式 maxSamples 保留历史抽样用途，并包含端点；delta 默认为 0，正值以观测锚点插值加速，全量观测仍参与局部权重与稳健残差。fitted 按 x 排序，保留重复样本。此默认行为调整会改变旧 LOWESS 曲线，调用方需要明确选择参数。
- LOWESS 使用查询点附近的局部 x/y 坐标，避免远处观测压缩近邻精度；只有距离或插值区间溢出时才改用归一化 x 距离。
- 等距离邻域选择较小 x，再按 y 排序，不依赖调用方行顺序。相同 x 的零半径邻域包含所有相同 x 观测。零核权重时用最近有效观测的加权常数，等距离取均值；没有有效稳健观测时明确报错。median=0 时保留数值精度内零残差点的权重，对明显非零残差赋零权重。
- regressionBootstrap 从包根导出，仅 linear/polynomial。options 为 method/degree?/grid/level/resamples/seed，完整 (x,y) 成对有放回抽样，每次拟合一次。原始组须有满秩设计及正残差自由度，退化重采样在原始固定归一化基底中取最小范数解，不删抽样或重抽。每个 grid 位置按线性插值分位数生成 lower/upper，表示均值响应的逐点 percentile CI，不是预测区间。

既有 confidenceInterval 的正态临界值与旧区间用途没有在本轮改成 bootstrap。尤其旧多项式/LOWESS 区间近似不能用来声称符合新的回归置信带契约；完整整理独立处理。

缺失 accessor 的既有排除行为保留；无穷大不参与拟合，StatPlots 另有更严格的有限原始观测边界。新增求解器不修改输入。bootstrap 在内部对配对排序，同组同 seed 可复现；不承诺与 NumPy RNG 相同。

独立数值对照见 __tests__/fixtures/generate-regression-python.py 与固定 JSON。LOWESS 正常非退化数据对照 statsmodels，bootstrap 重放同一抽样索引后对照 NumPy 最小二乘与分位数。退化/ties 行为及坐标基底差异单独声明，不承诺全部参数逐位相同。

性能在真实 Node 构建产物测量，避免 Jest VM 对 Math 属性代理的显著额外成本；先 npm run build，再运行 lowess-performance.test.ts 或 node benchmarks/lowess.cjs。保留原 100/150/200ms 预算，使用显式 delta 并断言所有节点保留，精确路径另由数值测试和浏览器实测覆盖。VUtils 的 Jest 配置使用单 worker，CI 的 Rush test 使用 --parallelism 1，避免同包或其他包并发测试影响墙钟预算；所有单元与性能用例均执行。

## 调用示例

```ts
import { regressionLinear, regressionBootstrap, regressionLowess } from '@visactor/vutils';

const samples = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 7 }];
const model = regressionLinear(samples);
const curve = model.evaluateGrid(100);
const bounds = regressionBootstrap(samples, {
  method: 'linear', grid: curve.map(p => p.x), level: 0.95, resamples: 1000, seed: 0
});
const smooth = regressionLowess(samples, undefined, undefined, { span: 2 / 3, iterations: 3, delta: 0 });
// bounds 与 curve 使用相同 x；LOWESS 的 fitted 保留排序后的全部有效观测。
const prediction = smooth.predict(1);
```

bootstrap 的 level 严格在 (0,1)，resamples 为正整数，seed 为 uint32；grid 为有限数字数组。主模型不满秩或没有残差自由度时抛出 RangeError。bootstrap 的多项式使用 method='polynomial' 和正整数 degree。图表层可采用更严格的次数和预算上限，不改变通用求解器契约。
