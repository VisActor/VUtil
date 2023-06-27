import { rollup } from 'rollup';
import path from 'path';
import type { OutputOptions, RollupBuild } from 'rollup';
import type { RawPackageJson } from '../logic/package';
import type { Config } from '../logic/config';
import { getBabelPlugins } from '../logic/babel.config';
import { getRollupOptions } from '../logic/rollup.config';
import { DebugConfig } from '../logic/debug';

async function generateOutputs(bundle: RollupBuild, outputOptionsList: OutputOptions[]) {
  for (const outputOptions of outputOptionsList) {
    await bundle.write(outputOptions);
  }
}
function packageNameToPath(name: string) {
  return name.replace('@', '').replace('/', '_');
}

async function buildUmdES56(
  config: Config,
  projectRoot: string,
  rawPackageJson: RawPackageJson,
  minify: boolean,
  es5 = false
) {
  const babelPlugins = getBabelPlugins(rawPackageJson.name, es5);
  const entry = path.resolve(
    projectRoot,
    config.sourceDir,
    typeof config.input === 'string' ? config.input : config.input.umd!
  );
  const rollupOptions = getRollupOptions(projectRoot, entry, rawPackageJson, babelPlugins, config);
  DebugConfig('RollupOptions', JSON.stringify(rollupOptions));
  const bundle = await rollup(rollupOptions);

  const dest = path.resolve(projectRoot, config.outputDir.umd!);
  await generateOutputs(bundle, [
    {
      format: 'umd',
      name: config.name || packageNameToPath(rawPackageJson.name),
      file: minify
        ? `${dest}/${config.umdOutputFilename || packageNameToPath(rawPackageJson.name)}${es5 ? '.es5' : ''}.min.js`
        : `${dest}/${config.umdOutputFilename || packageNameToPath(rawPackageJson.name)}${es5 ? '.es5' : ''}.js`,
      exports: 'named',
      globals: { react: 'React' }
    }
  ]);

  if (bundle) {
    await bundle.close();
  }
}

export async function buildUmd(config: Config, projectRoot: string, rawPackageJson: RawPackageJson, minify: boolean) {
  await buildUmdES56(config, projectRoot, rawPackageJson, minify, false);
  await buildUmdES56(config, projectRoot, rawPackageJson, minify, true);
}
