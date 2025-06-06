// Custom React Native mock to avoid Flow syntax issues
module.exports = {
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  ActivityIndicator: 'ActivityIndicator',
  Image: 'Image',
  Button: 'Button',
  Pressable: 'Pressable',
  StyleSheet: {
    create: jest.fn((styles) => styles),
    compose: jest.fn(),
    flatten: jest.fn(),
  },
  Animated: {
    View: 'AnimatedView',
    Text: 'AnimatedText',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      interpolate: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    sequence: jest.fn(),
    parallel: jest.fn(),
    spring: jest.fn(),
    decay: jest.fn(),
  },
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  DeviceEventEmitter: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
  NativeModules: {},
  PermissionsAndroid: {
    PERMISSIONS: {},
    RESULTS: {},
    request: jest.fn(() => Promise.resolve(true)),
    check: jest.fn(() => Promise.resolve(true)),
  },
};