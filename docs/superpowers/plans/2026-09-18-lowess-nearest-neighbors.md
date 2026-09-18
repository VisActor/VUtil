# LOWESS Nearest Neighbors Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 恢复 LOWESS 按实际距离选择最近邻的语义，消除散点回归线用例的数值差异，同时保留已有性能优化。

**Architecture:** 保留数据预排序和二分定位，从插入点用左右双指针按距离扩展，选择最近的 m 个样本。加权拟合、稳健迭代和置信区间继续复用当前实现；不新增公开 API。用独立的直接计算参考函数和优化前的固定输出分别验证算法与真实用例。

**Tech Stack:** TypeScript 4.9.5、Jest 29.5、ts-jest、Rush 5.164.0、pnpm 10.7.0；Node.js >=20.19.6。

## Global Constraints

- 计划制定阶段未执行实现；用户随后授权执行修复。执行范围包含本地修改、安装锁定依赖、验证与本地提交，不包含推送、发版或修改 bugserver 基准图。
- 执行时只修改 LOWESS 邻域选择及其直接相关的边界处理，新增确定性测试；不重构其他回归算法。
- 保留 maxSamples=1000、span=0.3、degree=1 和已有稳健迭代默认策略；本例 n=406，不触发抽样和 n>500 时关闭默认迭代的分支。
- 不承诺大数据默认配置恢复到优化前结果：抽样及迭代策略属于另一项行为变化，不在本次修复范围内。
- 不引入运行时依赖，不手改版本号或自动生成的历史 changelog。
- 不在预测时对所有距离排序。常规单点预测保持 O(log n + m)，其中 n 是抽样后的样本数；全零权重的罕见回退允许 O(n) 扫描。
- 最近点等距且需要回退时，沿用旧版的输入顺序优先规则。边界等距点的 tricube 权重为零，不要求改变其累加顺序以追求浮点逐位一致。
- 新测试不使用 Math.random；旧版对照的绝对误差阈值为 1e-8。
- 上述执行技能当前未安装；本次按已确认计划在当前任务直接执行，没有创建子任务。

## 已确认的依据和方案选择

- 引入提交：b0766a02eafa6ed3f40778224343f320d1def84f，2025-12-05，v1.0.21 起包含。
- 问题位置：packages/vutils/src/common/regression-lowess.ts 的 start/end/actualStart 窗口计算。
- 用例：https://bugserver.cn.goofy.app/case?product=chartspace4&fileid=68f8b0ca43ec0700a96ec5ad
- 页面原始数据 406 条，坐标序列校验值 718450318，N=floor(406/4)=101，m=floor(406*0.3)=121。
- x=12 时，旧邻域范围 [9,18]、半径 6；当前范围 [0,18]、半径 12。
- 当前与旧版曲线最大差值 1.2197504464103162；仅替换窗口选择的实验最大误差 5.8832938520936295e-12。
- 诊断材料位于 /Users/bytedance/.codex/visualizations/2026/09/18/01a0b27e-d458-7ea0-85ba-6754954cf853/lowess-diagnosis/，其中 results.json 保存 data、grids.old、cis.old，compare.cjs 保存复现方法。

选用“排序 + 二分 + 双指针”。整体回退 b0766a0 会一起移除抽样等优化；恢复每次距离排序会重新引入 O(n log n) 的预测成本。这两种方案均扩大改动或牺牲已有性能。

## 文件职责

| 文件 | 操作 | 职责 |
| --- | --- | --- |
| packages/vutils/src/common/regression-lowess.ts | 修改 | 最近邻窗口、样本数边界、等距回退 |
| packages/vutils/__tests__/lowess-neighbors.test.ts | 新增 | 非均匀数据和边界的独立数值验证 |
| packages/vutils/__tests__/data/lowess-scatter.ts | 新增 | 固定 406 条坐标及旧版曲线、置信区间基准 |
| packages/vutils/__tests__/lowess-compatibility.test.ts | 新增 | 原用例的端到端数值回归 |
| packages/vutils/__tests__/lowess-accuracy.test.ts | 复用 | 已有精度覆盖 |
| packages/vutils/__tests__/lowess-performance.test.ts | 复用 | 已有性能覆盖，不放宽阈值 |

## Task 1: 修复最近邻选择，加入确定性算法测试

**Files:** 修改 regression-lowess.ts；新增 lowess-neighbors.test.ts，完整路径见上表。

**Interfaces:** 消费既有 regressionLowess(data, x?, y?, options?)；保持 predict、evaluate、evaluateGrid、confidenceInterval 的签名及返回结构。

- [x] **Step 1: 准备执行环境**

先检查工作区变化；在执行修复时创建 codex/fix-lowess-nearest-neighbors 分支，若同名分支已存在则检查并复用，避免覆盖其他工作。当前 VUtil 未安装包内依赖；从仓库根目录使用锁文件安装，禁止为此重写锁文件：

```bash
node common/scripts/install-run-rush.js install
```

- [x] **Step 2: 写独立最近邻参考函数及失败测试**

在 lowess-neighbors.test.ts 写入以下代码。参考实现仅用于小数据测试，直接按距离排序；生产实现不得调用它。

```ts
import { regressionLowess } from '../src/common/regression-lowess';

type Point = { x: number; y: number };

function referencePredict(data: Point[], x0: number, span: number, degree: 0 | 1) {
  if (!data.length) {
    return 0;
  }
  const count = Math.min(data.length, Math.max(2, Math.floor(span * data.length)));
  const nearest = data
    .map((p, index) => ({ ...p, index, distance: Math.abs(p.x - x0) }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .slice(0, count);
  const radius = nearest[nearest.length - 1].distance;
  let sw = 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  nearest.forEach(p => {
    const u = radius === 0 ? 0 : p.distance / radius;
    const w = u >= 1 ? 0 : Math.pow(1 - u * u * u, 3);
    sw += w;
    sx += w * p.x;
    sy += w * p.y;
    sxx += w * p.x * p.x;
    sxy += w * p.x * p.y;
  });
  if (sw === 0) {
    return nearest[0].y;
  }
  if (degree === 0) {
    return sy / sw;
  }
  const meanX = sx / sw;
  const meanY = sy / sw;
  const denominator = sxx - sx * meanX;
  const slope = Math.abs(denominator) < 1e-12 ? 0 : (sxy - sx * meanY) / denominator;
  return meanY + slope * (x0 - meanX);
}

const cases: Point[][] = [
  [0, 100, 101, 102, 103, 104, 105, 106, 107, 108].map(x => ({ x, y: x * x })),
  [0, 0.1, 0.2, 0.3, 3, 10, 20, 20.1, 20.2, 50].map(x => ({ x, y: Math.sin(x) })),
  [{ x: 2, y: 20 }, { x: 0, y: 5 }],
  [1, 2, 3, 4, 5, 6, 7].map(y => ({ x: 1, y })),
  [{ x: 4, y: 9 }],
  []
];

describe('LOWESS nearest neighbors', () => {
  test.each([0, 1] as const)('matches distance-ranked neighbors for degree=%i', degree => {
    for (const data of cases) {
      for (const span of [0.3, 0.6, 1]) {
        const model = regressionLowess(data, undefined, undefined, { span, degree, iterations: 0 });
        for (const x0 of [-4, 0, 0.15, 1, 2.5, 12, 20, 100.5, 130]) {
          expect(Math.abs((model.predict(x0) as number) - referencePredict(data, x0, span, degree)))
            .toBeLessThan(1e-8);
        }
        for (const p of model.evaluateGrid(11)) {
          expect(Math.abs(p.y - referencePredict(data, p.x, span, degree))).toBeLessThan(1e-8);
        }
      }
    }
  });

  test('uses original input order when equally near points have zero weight', () => {
    const model = regressionLowess([{ x: 2, y: 20 }, { x: 0, y: 5 }]);
    expect(model.predict(1)).toBe(20);
  });

  test('keeps the first coincident points when the neighborhood radius is zero', () => {
    const data = [1, 2, 3, 4, 5, 6, 7].map(y => ({ x: 1, y }));
    expect(regressionLowess(data).predict(1)).toBe(1.5);
  });
});
```

- [x] **Step 3: 确认新测试在未修复源码上失败**

以下命令均在 packages/vutils 执行：

```bash
node ../../common/scripts/install-run-rushx.js test --runInBand --runTestsByPath __tests__/lowess-neighbors.test.ts
```

预期：非均匀数据的数值断言失败。若出现依赖或编译错误，先排除环境错误，不能将其视为成功复现。

- [x] **Step 4: 按实际距离扩展窗口**

在 predictSingle 中，保留 lower_bound 二分查找，以如下代码替换 m、start、end、actualStart 计算。其余距离、权重与拟合计算继续使用 actualStart/end。

```ts
const m = Math.min(n, Math.max(2, Math.floor(span * n)));
let lo = left - 1;
let hi = left;
for (let count = 0; count < m; count++) {
  if (lo >= 0 && (hi >= n || x0 - ptsX[lo] <= ptsX[hi] - x0)) {
    lo--;
  } else {
    hi++;
  }
}
const actualStart = lo + 1;
const end = hi;
```

说明：每次消耗距离更近的一侧，窗口最终恰有 m 个样本；n=0 的已有提前返回继续保留。m 的外层 n 上限保护单点输入。距离相等时选左侧，仅影响零权重边界的取舍；当距离半径为零时，lower_bound 从重复 x 的第一项开始向右取样，保留旧版的输入顺序。

- [x] **Step 5: 保证全零权重回退的等距规则**

使用内部类型保留原始顺序；相应更新 rawPoints、stratifiedSample 入参与 sampled 数组类型：

```ts
interface LowessPoint {
  x: number;
  y: number;
  index: number;
}

// rawPoints 的采集：
const rawPoints: LowessPoint[] = [];
visitPoints(data, x, y, (dx, dy, index) => {
  rawPoints.push({ x: dx, y: dy, index });
});
```

将 sumw===0 的插入点回退替换为以下逻辑。它仅在权重全零时执行；正常拟合无需额外全表扫描：

```ts
if (sumw === 0) {
  let nearestIdx = 0;
  let nearestDistance = Math.abs(ptsX[0] - x0);
  for (let i = 1; i < n; i++) {
    const distance = Math.abs(ptsX[i] - x0);
    if (
      distance < nearestDistance ||
      (distance === nearestDistance && sampledPoints[i].index < sampledPoints[nearestIdx].index)
    ) {
      nearestIdx = i;
      nearestDistance = distance;
    }
  }
  return ptsY[nearestIdx];
}
```

不在本次处理非法 span、NaN 查询、evaluateGrid(1) 等已有独立问题。

- [x] **Step 6: 验证测试通过并形成第一项可审查改动**

重跑 Step 3。检查生产路径没有距离排序；公开类型未变化；抽样和有效迭代数分支未变化。执行阶段按仓库流程提交，建议消息：`fix: preserve LOWESS nearest-neighbor selection`。提交应同时包含生产修复和本任务测试。

## Task 2: 固化真实用例的曲线及置信区间回归测试

**Files:** 新增 data/lowess-scatter.ts 和 lowess-compatibility.test.ts，完整路径见上表。

**Interfaces:** 测试消费 Task 1 保持不变的 API；fixture 导出 lowessScatterData、expectedGrid、expectedCI，分别为坐标数组、101 个旧版网格点和 101 个旧版置信区间结果。

- [x] **Step 1: 将已经验证的原始数据和旧版结果固化入库**

从仓库根目录执行以下一次性转换。自动化测试本身不能依赖临时目录、邻接 VChart 仓库、网络或 git 历史：

```python
import json
from pathlib import Path

source = Path('/Users/bytedance/.codex/visualizations/2026/09/18/01a0b27e-d458-7ea0-85ba-6754954cf853/lowess-diagnosis/results.json')
r = json.loads(source.read_text())
assert len(r['data']) == 406
assert len(r['grids']['old']) == len(r['cis']['old']) == 101
pairs = [[p['x'], p['y']] for p in r['data']]
h = 2166136261
for c in json.dumps(pairs, separators=(',', ':')):
    h = ((h ^ ord(c)) * 16777619) & 0xffffffff
assert h == 718450318
out = Path('packages/vutils/__tests__/data/lowess-scatter.ts')
out.parent.mkdir(parents=True, exist_ok=True)
text = '// Baseline: b0766a0^ LOWESS, default options, evaluateGrid(101) / confidenceInterval(101).\n'
text += '// Dataset: scatter regression example; 406 (milesPerGallon, horsepower) pairs.\n'
for name, value in [('lowessScatterData', r['data']), ('expectedGrid', r['grids']['old']), ('expectedCI', r['cis']['old'])]:
    text += f'export const {name} = ' + json.dumps(value, separators=(',', ':')) + ';\n'
out.write_text(text)
```

这些是已计算的优化前结果，不能以修复后函数输出重新生成基准。fixture 只保存公开示例坐标，不保存汽车名称或内部页面配置。

- [x] **Step 2: 写真实用例断言**

```ts
import { regressionLowess } from '../src/common/regression-lowess';
import { lowessScatterData, expectedGrid, expectedCI } from './data/lowess-scatter';

function expectNear(actual: number, expected: number) {
  expect(Number.isFinite(actual)).toBe(true);
  expect(Math.abs(actual - expected)).toBeLessThan(1e-8);
}

test('preserves the scatter LOWESS curve and confidence intervals', () => {
  expect(lowessScatterData).toHaveLength(406);
  const model = regressionLowess(lowessScatterData);
  const grid = model.evaluateGrid(101);
  const ci = model.confidenceInterval(101);
  expect(grid).toHaveLength(expectedGrid.length);
  expect(ci).toHaveLength(expectedCI.length);
  grid.forEach((point, i) => {
    expectNear(point.x, expectedGrid[i].x);
    expectNear(point.y, expectedGrid[i].y);
  });
  const keys = ['x', 'mean', 'lower', 'upper', 'predLower', 'predUpper'] as const;
  ci.forEach((point, i) => {
    keys.forEach(key => expectNear(point[key], expectedCI[i][key]));
  });
  const predicted = model.predict(expectedCI.map(point => point.x)) as number[];
  predicted.forEach((value, i) => expectNear(value, expectedCI[i].mean));
});
```

注意：旧版和当前实现均只有 evaluateGrid 使用稳健迭代，predict/CI 不使用；因此 predict 对比 CI.mean，不能错误地要求 predict 与默认 evaluateGrid 一致。本次不改变这项既有行为。

- [x] **Step 3: 验证能阻止原问题复发**

从 packages/vutils 运行：

```bash
node ../../common/scripts/install-run-rushx.js test --runInBand --runTestsByPath __tests__/lowess-neighbors.test.ts __tests__/lowess-compatibility.test.ts __tests__/lowess-accuracy.test.ts __tests__/regression.test.ts
```

预期全部通过。再在临时副本中仅替换回原 start/end/actualStart 计算，运行 compatibility 测试，预期数值失败；不要覆盖工作区文件。执行阶段将 fixture 与兼容性测试作为独立可审查提交，建议消息：`test: preserve LOWESS scatter regression output`。

## Task 3: 性能、包级检查与原用例验收

**Files:** 复用现有性能测试和包级配置；不计划新增性能框架、调整 CI 或放宽现有阈值。

**Interfaces:** 对已修复的 regressionLowess 运行现有调用；输出测试结果、性能记录和图像验收结果。

- [x] **Step 1: 运行已有性能测试**

在 packages/vutils 执行：

```bash
RUN_PERF_TESTS=true node ../../common/scripts/install-run-rushx.js test --runInBand --runTestsByPath __tests__/lowess-performance.test.ts
```

验收使用已有阈值：1K <100ms、5K <150ms、10K <100ms、20K <200ms；maxSamples=500 <100ms、maxSamples=2000 <200ms。记录实际耗时。若失败，先区分环境波动与修复引入的额外成本，不通过放宽阈值使测试变绿。

- [x] **Step 2: 完成包级验证**

在 packages/vutils 执行；不自动修复全包格式：

```bash
CI=true node ../../common/scripts/install-run-rushx.js test --runInBand
node ../../common/scripts/install-run-rushx.js compile
node node_modules/eslint/bin/eslint.js src/common/regression-lowess.ts __tests__/lowess-neighbors.test.ts __tests__/lowess-compatibility.test.ts __tests__/data/lowess-scatter.ts
node ../../common/scripts/install-run-rushx.js build
```

若遇到既有随机测试或编译配置失败，先用未改源码的相同命令确认基线，明确区分已有问题，不扩大本次修复范围。

- [ ] **Step 3: 用实际消费链路复验截图**

在可加载本地修复构建的 VChart/ChartSpace 测试环境中运行同一份 406 条数据和三条回归线配置。沿用同一渲染版本、画布尺寸和截图环境，比较旧算法与修复后的输出；确认蓝色 LOWESS 曲线及置信带恢复，红色多项式和绿色线性回归保持一致。不得为消除 diff 执行 Set To Standard。

如果执行环境不能注入本地构建，先交付完成的代码、数值和性能验证，并明确“bugserver 图像复验待修复构建可用”，不能声称线上截图已经恢复。图像验收不通过时应首先比较传入数据与 101 个网格点，再检查渲染环境差异。

- [x] **Step 4: 汇总交付结果**

在修复说明中记录：错误的固定下标窗口、实际距离最近邻修复、原用例最大误差、新增测试和性能结果。按当前发布流程作为 patch 修复；后续若要求 PR，标题可用 `fix: preserve LOWESS nearest-neighbor selection`，不在本计划执行期间直接发布版本或改线上基准。

## 完成标准

- 非均匀分布的失败测试在修复前失败、修复后通过。
- 空数据、单点、重复 x、域外预测和等距回退有确定性断言。
- 原用例 101 个曲线点及所有 CI 数值与优化前绝对误差 <1e-8。
- 已有 LOWESS 精度和性能测试通过，包级检查结果明确。
- 生产预测不恢复每次全量距离排序；公开 API、抽样及迭代默认策略不变。
- 原消费环境图像复验完成，或明确留下依赖修复构建的验收项；不重置基准图。

## 计划自检

已核对：根因、目标、文件职责、函数签名、测试基准来源、重复 x 和等距语义、性能门槛、发布边界。没有将数值验证等同于浏览器像素验证，也没有将大数据默认行为变化包含在本次修复中。


## 执行结果（2026-09-18）

- 分支：`codex/fix-lowess-nearest-neighbors`。算法修复与最近邻测试已提交为 `63b1491`。
- 修复前：新增 18 项测试中 10 项失败，包含真实用例的数值差异；修复后全部通过。
- 新增独立直接距离排序参考、非均匀分布、乱序重复 x、等距回退、单点及空数据测试。合成数据调整了坐标尺度和外推范围以避免把浮点消减误差混入邻域正确性断言，没有放宽 `1e-8` 阈值。
- 固化 406 条公开示例坐标，校验值为 `718450318`，并保存优化前 101 个曲线点和置信区间结果。
- 全包 Jest：44 个测试套件、197 项测试通过；6 项性能测试在 CI 模式下跳过后另行显式运行并全部通过。
- 独立性能测试整项耗时：1K 4 ms、5K 4 ms、10K 5 ms、20K 7 ms；自定义 maxSamples 对照项合计 36 ms。原始计时阈值全部满足。
- 修改文件的 ESLint 通过；CJS、ES、UMD 和压缩 UMD 构建成功。
- 对实际 CJS 构建再计算：曲线最大误差 `5.8832938520936295e-12`，CI 全部字段最大误差 `5.3717030823463574e-12`。
- 临时副本中仅恢复错误的固定窗口，真实用例回归测试重新失败，首个差值 `0.024079300530246428`；工作区源码保持修复状态。
- 原始 `compile` 命令报 TS6059：`rootDir=src` 与 `include=__tests__` 冲突。用修改前 HEAD 的临时归档确认同样失败。未修改项目配置；以下覆盖命令通过：

```bash
node node_modules/typescript/bin/tsc --noEmit --rootDir . --composite false --incremental false --types node,jest
```

- 锁文件、公开 API、抽样和稳健迭代默认策略均未变更。
- 未完成的外部验收：bugserver 图像复验需要可加载此 VUtil 构建的 ChartSpace 测试版本。本地没有已构建的对应 ChartSpace/VChart-extension 消费环境，未修改线上用例或重置基准图。数值与构建验证已完成，不能据此声称线上截图已复验。
