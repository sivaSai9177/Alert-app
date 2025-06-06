module.exports = (api) => {
  api.cache(true);
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
    plugins: [
      ["inline-import", { extensions: [".sql"] }],
      // react-native-reanimated/plugin has to be listed last.
      "react-native-reanimated/plugin",
    ],
  };
};
