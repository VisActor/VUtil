"""独立数值对照；Python 只生成固定 fixture，不参与图表运行。

依赖 numpy/statsmodels。成对 bootstrap 显式重放公共 LCG 的索引，
对比的是 NumPy 最小二乘与分位数，不假设 NumPy RNG 使用相同 seed 序列。
"""
import json
import math
import platform
from pathlib import Path
import numpy as np
import statsmodels
from statsmodels.nonparametric.smoothers_lowess import lowess


def basis(data):
    points = np.array([[p['x'], p['y']] for p in data], dtype=float)
    center = points.min(axis=0) / 2 + points.max(axis=0) / 2
    scale = np.maximum(np.abs(points.min(axis=0) - center), np.abs(points.max(axis=0) - center))
    scale[scale == 0] = 1
    return points, center, scale


def predict(data, options, grid, fixed=None):
    points, center, scale = basis(data) if fixed is None else (np.array([[p['x'], p['y']] for p in data]), *fixed)
    degree = 1 if options['method'] == 'linear' else options['degree']
    matrix = np.polynomial.polynomial.polyvander((points[:, 0] - center[0]) / scale[0], degree)
    coef = np.linalg.lstsq(matrix, (points[:, 1] - center[1]) / scale[1], rcond=64*np.finfo(float).eps*(degree+1))[0]
    return center[1] + scale[1]*np.polynomial.polynomial.polyval((np.array(grid) - center[0])/scale[0], coef)


cases = []
for method, degree, offset in [('linear', 1, 0), ('linear', 1, 1e12), ('polynomial', 2, 1e9), ('polynomial', 3, 0), ('polynomial', 5, 0)]:
    data = []
    for i in range(17):
        t = i/2 - 4
        y = 1 + 2*t + (0.3*t*t if degree > 1 else 0) + (0.01*t**degree if degree > 2 else 0) + 0.2*math.sin(i*1.7)
        data.append({'x': offset+t, 'y': y})
    options = {'method': method, **({'degree': degree} if method == 'polynomial' else {})}
    grid = [p['x'] for p in data]
    expected = predict(data, options, grid)
    cases.append({'name': f'{method}-{degree}-offset-{offset:g}', 'data': data, 'options': options, 'expected': expected.tolist()})

for iterations, delta in [(0, 0), (3, 0), (3, 0.7)]:
    data = [{'x': i/5, 'y': math.sin(i/6)+i/20+(8 if i == 20 else 0)} for i in range(41)]
    x = np.array([p['x'] for p in data]); y = np.array([p['y'] for p in data])
    expected = lowess(y, x, frac=0.5, it=iterations, delta=delta, return_sorted=False)
    cases.append({'name': f'lowess-it{iterations}-delta{delta}', 'data': data,
                  'options': {'method': 'lowess', 'span': 0.5, 'iterations': iterations, 'delta': delta}, 'expected': expected.tolist()})

bootstraps = []
for method, degree in [('linear', 1), ('polynomial', 2), ('polynomial', 5)]:
    data = [{'x': x, 'y': 1+0.4*x+x*x/8+math.sin(x)*0.3} for x in range(9)]
    options = {'method': method, **({'degree': degree} if method == 'polynomial' else {}),
               'level': 0.95, 'resamples': 100, 'seed': 0, 'grid': [0, 1.5, 4, 8]}
    _, center, scale = basis(data)
    state = options['seed']; repeats = []
    first_indices = None
    for _ in range(options['resamples']):
        indices = []
        for i in range(len(data)):
            state = (1664525*state+1013904223) % 4294967296
            indices.append(int(state/4294967296*len(data)))
        if first_indices is None: first_indices = indices
        repeats.append(predict([data[i] for i in indices], options, options['grid'], (center, scale)))
    lower, upper = np.quantile(np.array(repeats), [0.025, 0.975], axis=0, method='linear')
    bootstraps.append({'data': data, 'options': options, 'firstIndices': first_indices,
                       'expected': [{'x': x, 'lower': float(a), 'upper': float(b)} for x, a, b in zip(options['grid'], lower, upper)]})

output = {'versions': {'python': platform.python_version(), 'numpy': np.__version__, 'statsmodels': statsmodels.__version__},
          'absoluteTolerance': 5e-8, 'cases': cases, 'bootstraps': bootstraps}
destination = Path(__file__).with_name('regression-python.json')
destination.write_text(json.dumps(output, ensure_ascii=False, indent=2, allow_nan=False)+'\n')
print(destination)
