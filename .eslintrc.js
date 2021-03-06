module.exports = {
  extends: ['plugin:jest/recommended', 'airbnb'],
  parser: 'babel-eslint',

  env: {
    es6: true,
    jasmine: true,
  },

  plugins: [
    'jest',
    'react',
    'jsx-a11y',
  ],

  // Map from global var to bool specifying if it can be redefined
  globals: {
    __DEV__: true,
    __dirname: false,
    __fbBatchedBridgeConfig: false,
    alert: false,
    cancelAnimationFrame: false,
    cancelIdleCallback: false,
    clearImmediate: true,
    clearInterval: false,
    clearTimeout: false,
    console: false,
    document: false,
    escape: false,
    Event: false,
    EventTarget: false,
    exports: false,
    fetch: false,
    FormData: false,
    global: false,
    jest: false,
   'jest/globals': false,
    Map: true,
    module: false,
    navigator: false,
    process: false,
    Promise: true,
    requestAnimationFrame: true,
    requestIdleCallback: true,
    require: false,
    Set: true,
    setImmediate: true,
    setInterval: false,
    setTimeout: false,
    window: false,
    XMLHttpRequest: false,
    pit: false,
    FileReader: true,
    btoa: true,

    // Flow global types.
    ReactComponent: false,
    ReactClass: false,
    ReactElement: false,
    ReactPropsCheckType: false,
    ReactPropsChainableTypeChecker: false,
    ReactPropTypes: false,
    SyntheticEvent: false,
    $Either: false,
    $All: false,
    $ArrayBufferView: false,
    $Tuple: false,
    $Supertype: false,
    $Subtype: false,
    $Shape: false,
    $Diff: false,
    $Keys: false,
    $Enum: false,
    $Exports: false,
    $FlowIssue: false,
    $FlowFixMe: false,
    $FixMe: false,
  },
  rules: {
    'react/jsx-filename-extension': 0,
    'no-underscore-dangle': ['error', { allow: ['_id', '__html', '_style'] }],
  },
};
