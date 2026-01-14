module.exports = (api) => {
  api.cache(true);
  
  const plugins = [
    ["inline-import", { extensions: [".sql"] }],
  ];
  
  // Always include reanimated plugin but with web-safe config
  plugins.push([
    "react-native-reanimated/plugin",
    {
      // This prevents the plugin from adding web-incompatible code
      globals: ['__reanimatedWorkletInit', '__reanimatedModuleProxy'],
    }
  ]);
  
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          unstable_transformImportMeta: true,
        },
      ],
      "nativewind/babel",
    ],
    plugins,
  };
};
