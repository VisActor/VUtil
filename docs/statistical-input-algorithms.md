# 原始统计样本工具

新增包根导出 mean、correlation、bootstrapEstimate，供统计绘图及其他调用方复用；均不修改输入。

- mean：只读有限数值数组，空数组返回 undefined；使用缩放与补偿求和，避免直接求和溢出。
- correlation(x,y,method)：等长只读有限数组，默认 pearson，支持 spearman 和 kendall tau-b；少于两条或常量返回 undefined。非法方法、长度或非有限输入报 RangeError。Pearson O(N)，秩相关与 tau-b O(N log N)，平均并列秩、共同并列及逆序数按对应定义处理。缺失值配对由调用方完成。
- bootstrapEstimate(values,estimator,{resamples,seed})：有放回抽取组内 N 条，使用现有 randomLCG；resamples 为正整数、seed 为 uint32，返回各次估计。只读回调不得修改或保留复用缓冲区，结果必须有限。空/非有限样本、非法参数或结果报 RangeError。均值通常 O(BN)，排序型中位数 O(BN log N)。

## 用法

```ts
import { mean, correlation, bootstrapEstimate } from '@visactor/vutils';

mean([1, 2, 3]); // 2
correlation([1, 2, 3], [3, 2, 1]); // Pearson，约 -1
correlation([1, 1, 2], [1, 2, 3], 'spearman'); // 使用平均秩处理并列值
correlation([1, 1, 2], [1, 2, 3], 'kendall'); // Kendall tau-b

const estimates = bootstrapEstimate([1, 2, 10], sample => mean(sample)!, {
  resamples: 1000,
  seed: 42
});
```

mean 使用补偿求和减少大值抵消时的精度损失，例如 `[1e308, 1, -1e308]` 的均值约为 `1/3`。

bootstrap 为减少分配会复用样本缓冲区；如需保留样本，请在估计器回调中复制。相同输入、种子及确定性的估计器产生相同结果。随机索引来自现有 randomLCG，不保证与其他随机数生成器的相同种子产生相同结果。

这些 API 没有 Python 或新的运行时依赖。调用方应在包含这些 API 的正式版本发布后更新依赖；本次改动沿用仓库统一版本策略。
