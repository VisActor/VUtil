// 性能在真实 Node 环境测量，避免 Jest VM 的 Math 代理成本；先 npm run build。
const { regressionLowess } = require('../cjs');
const n = Number(process.argv[2] || 10000);
const maxSamples = process.argv[3] ? Number(process.argv[3]) : undefined;
const data = Array.from({ length: n }, (_, i) => ({
  x: i / n, y: Math.sin(2 * Math.PI * i / n) + Math.sin(i * 137.508) * 0.1
}));
const start = performance.now();
const model = regressionLowess(data, undefined, undefined, { delta: 0.01, maxSamples });
const grid = model.evaluateGrid(50);
process.stdout.write(JSON.stringify({ elapsed: performance.now() - start, nodes: model.fitted.length, grid }));
