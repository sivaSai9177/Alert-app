// Mock implementation of react-native-reanimated for web
// This prevents errors when reanimated APIs are called on web

const View = require('react-native').View;

// Mock animated component
const AnimatedView = View;

// Mock hooks and functions
const useSharedValue = (initialValue) => ({ value: initialValue });
const useAnimatedStyle = () => ({});
const withTiming = (toValue) => toValue;
const withSpring = (toValue) => toValue;
const withSequence = () => 0;
const withDelay = (delay, animation) => animation;
const interpolate = (value, inputRange, outputRange) => outputRange[0];
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;

// Mock Extrapolation
const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

// Default export
module.exports = {
  default: {
    View: AnimatedView,
    Text: View,
    ScrollView: View,
    Image: View,
    createAnimatedComponent: (component) => component,
  },
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolation,
  Extrapolate: Extrapolation, // Alias
  runOnJS,
  runOnUI,
  cancelAnimation: () => {},
  // Add any other APIs that might be used
  useAnimatedScrollHandler: () => ({}),
  useAnimatedGestureHandler: () => ({}),
  useAnimatedRef: () => ({ current: null }),
  useAnimatedReaction: () => {},
  useDerivedValue: (fn) => useSharedValue(fn()),
  useAnimatedProps: () => ({}),
  // Layout animations
  Layout: {},
  FadeIn: {},
  FadeOut: {},
  SlideInLeft: {},
  SlideInRight: {},
  SlideOutLeft: {},
  SlideOutRight: {},
};