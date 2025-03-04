const { validate } = require('schema-utils');

const schema = require('./options.json');

/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */

/**
 * @callback FormatterFunction
 * @param {LintResult[]} results
 * @returns {string}
 */

/**
 * @typedef {Object} OutputReport
 * @property {string=} filePath
 * @property {string|FormatterFunction=} formatter
 */

/**
 * @typedef {Object} PluginOptions
 * @property {string=} context
 * @property {boolean=} emitError
 * @property {boolean=} emitWarning
 * @property {string=} eslintPath
 * @property {string|string[]=} exclude
 * @property {string|string[]=} extensions
 * @property {boolean=} failOnError
 * @property {boolean=} failOnWarning
 * @property {string|string[]=} files
 * @property {boolean=} fix
 * @property {string|FormatterFunction=} formatter
 * @property {boolean=} lintDirtyModulesOnly
 * @property {boolean=} quiet
 * @property {OutputReport=} outputReport
 * @property {number|boolean=} threads
 * @property {RegExp|RegExp[]=} resourceQueryExclude
 * @property {string=} configType
 */

/** @typedef {PluginOptions & ESLintOptions} Options */

/**
 * @param {Options} pluginOptions
 * @returns {PluginOptions}
 */
function getOptions(pluginOptions) {
  const options = {
    cache: true,
    cacheLocation: 'node_modules/.cache/eslint-webpack-plugin/.eslintcache',
    configType: 'flat',
    extensions: 'js',
    emitError: true,
    emitWarning: true,
    failOnError: true,
    resourceQueryExclude: [],
    ...pluginOptions,
    ...(pluginOptions.quiet ? { emitError: true, emitWarning: false } : {}),
  };

  // @ts-ignore
  validate(schema, options, {
    name: 'ESLint Webpack Plugin',
    baseDataPath: 'options',
  });

  return options;
}

/**
 * @param {Options} loaderOptions
 * @returns {ESLintOptions}
 */
function getESLintOptions(loaderOptions) {
  const eslintOptions = { ...loaderOptions };

  // Keep the fix option because it is common to both the loader and ESLint.
  const { fix, extensions, ...eslintOnlyOptions } = schema.properties;

  // No need to guard the for-in because schema.properties has hardcoded keys.
  // eslint-disable-next-line guard-for-in
  for (const option in eslintOnlyOptions) {
    // @ts-ignore
    delete eslintOptions[option];
  }

  // Some options aren't available in flat mode
  if (loaderOptions.configType === 'flat') {
    delete eslintOptions.extensions;
  }

  return eslintOptions;
}

module.exports = {
  getOptions,
  getESLintOptions,
};
