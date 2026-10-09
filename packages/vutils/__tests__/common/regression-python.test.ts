import fixture from '../fixtures/regression-python.json';
import { regressionLinear, regressionPolynomial, regressionLowess, regressionBootstrap } from '../../src';

test.each(fixture.cases)('$name: public predictions match independent NumPy/statsmodels', item => {
  const options = item.options as {
    method: string;
    degree?: number;
    span?: number;
    iterations?: number;
    delta?: number;
  };
  const model =
    options.method === 'linear'
      ? regressionLinear(item.data)
      : options.method === 'polynomial'
      ? regressionPolynomial(item.data, undefined, undefined, options)
      : regressionLowess(item.data, undefined, undefined, {
          span: options.span,
          iterations: options.iterations,
          delta: options.delta
        });
  item.data.forEach((p, i) =>
    expect(Math.abs((model.predict(p.x) as number) - item.expected[i])).toBeLessThan(fixture.absoluteTolerance)
  );
});
test.each(fixture.bootstraps)(
  'public paired $options.method bootstrap matches independent least squares and quantiles',
  item => {
    const actual = regressionBootstrap(item.data, item.options as Parameters<typeof regressionBootstrap>[1]);
    actual.forEach((p, i) => {
      expect(Math.abs(p.lower - item.expected[i].lower)).toBeLessThan(fixture.absoluteTolerance);
      expect(Math.abs(p.upper - item.expected[i].upper)).toBeLessThan(fixture.absoluteTolerance);
    });
  }
);
