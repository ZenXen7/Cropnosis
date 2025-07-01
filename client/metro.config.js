const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable tree shaking and optimize bundle
config.transformer.minifierConfig = {
  // Enable aggressive tree shaking
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  // Optimize for production
  compress: {
    drop_console: process.env.NODE_ENV === 'production',
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug'],
  },
};

// Optimize assets
config.transformer.assetExts = [
  ...config.transformer.assetExts,
  'webp', // Support WebP for better compression
];

// Enable better caching
config.cacheStores = [
  {
    name: 'filesystem',
    root: './node_modules/.cache/metro',
  },
];

// Optimize resolver for faster builds
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Bundle splitting and code splitting optimization
config.serializer = {
  ...config.serializer,
  customSerializer: (entryPoint, preModules, graph, options) => {
    // Custom bundle splitting logic can be added here
    return require('metro/src/DeltaBundler/Serializers/baseJSBundle')(
      entryPoint,
      preModules,
      graph,
      options
    );
  },
};

module.exports = withNativeWind(config, { input: './app/globals.css' });