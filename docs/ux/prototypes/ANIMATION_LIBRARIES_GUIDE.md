# Animation Libraries Guide - Healthcare Alert System

## 🎬 Recommended Animation Libraries

### 1. Framer Motion (Web/React)
**Best for**: Complex gesture-based interactions, page transitions

```jsx
import { motion, AnimatePresence } from 'framer-motion';

// Alert Card Entry Animation
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -100 }}
  transition={{ type: "spring", stiffness: 300 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  <AlertCard />
</motion.div>

// Urgent Alert Pulse
<motion.div
  animate={{ 
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(220, 38, 38, 0.4)",
      "0 0 0 10px rgba(220, 38, 38, 0)",
      "0 0 0 0 rgba(220, 38, 38, 0)"
    ]
  }}
  transition={{ 
    duration: 2, 
    repeat: Infinity,
    ease: "easeInOut" 
  }}
/>

// Swipe to Acknowledge
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 200 }}
  onDragEnd={(e, { offset }) => {
    if (offset.x > 150) acknowledgeAlert();
  }}
/>
```

### 2. React Native Reanimated 3 (Mobile)
**Best for**: Native performance, gesture handling

```javascript
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate
} from 'react-native-reanimated';

// Escalation Timer Animation
const rotation = useSharedValue(0);
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { rotate: `${rotation.value}deg` },
    { scale: scale.value }
  ]
}));

// Trigger escalation animation
rotation.value = withSequence(
  withTiming(-5, { duration: 100 }),
  withSpring(5, { damping: 2 }),
  withTiming(0, { duration: 100 })
);

// Success checkmark animation
const checkmarkAnimation = () => {
  'worklet';
  return {
    transform: [
      {
        scale: withSequence(
          withTiming(0, { duration: 0 }),
          withSpring(1.2, { damping: 8 }),
          withTiming(1, { duration: 200 })
        )
      }
    ]
  };
};
```

### 3. Lottie (Cross-platform)
**Best for**: Complex animations, micro-interactions

```jsx
// React Native
import LottieView from 'lottie-react-native';

<LottieView
  source={require('./animations/emergency-pulse.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
/>

// Web
import Lottie from 'react-lottie';

const emergencyOptions = {
  loop: true,
  autoplay: true,
  animationData: emergencyPulseAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

<Lottie options={emergencyOptions} />
```

### 4. React Spring (Universal)
**Best for**: Physics-based animations, smooth transitions

```jsx
import { useSpring, animated, useChain, useSpringRef } from '@react-spring/web';

// Alert notification slide-in
const slideIn = useSpring({
  from: { transform: 'translateY(-100%)', opacity: 0 },
  to: { transform: 'translateY(0%)', opacity: 1 },
  config: { tension: 300, friction: 30 }
});

// Chained animations for alert acknowledgment
const scaleRef = useSpringRef();
const fadeRef = useSpringRef();

const scale = useSpring({
  ref: scaleRef,
  from: { scale: 1 },
  to: { scale: 0.9 },
  config: { duration: 100 }
});

const fade = useSpring({
  ref: fadeRef,
  from: { opacity: 1 },
  to: { opacity: 0 },
  config: { duration: 200 }
});

useChain([scaleRef, fadeRef], [0, 0.1]);
```

### 5. GSAP (GreenSock) - Web
**Best for**: Timeline-based animations, scroll triggers

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Alert timeline animation
const alertTimeline = gsap.timeline({ repeat: -1 });

alertTimeline
  .to('.alert-icon', { 
    rotation: 5, 
    duration: 0.1, 
    ease: 'power2.inOut' 
  })
  .to('.alert-icon', { 
    rotation: -5, 
    duration: 0.1, 
    ease: 'power2.inOut' 
  })
  .to('.alert-icon', { 
    rotation: 0, 
    duration: 0.1 
  })
  .to('.alert-glow', { 
    scale: 1.2, 
    opacity: 0, 
    duration: 0.6, 
    ease: 'power2.out' 
  }, '-=0.3');

// Scroll-triggered analytics
gsap.registerPlugin(ScrollTrigger);

gsap.to('.metric-card', {
  scrollTrigger: {
    trigger: '.analytics-section',
    start: 'top center',
    toggleActions: 'play none none reverse'
  },
  y: 0,
  opacity: 1,
  stagger: 0.1,
  duration: 0.6
});
```

### 6. React Native Gesture Handler + Reanimated
**Best for**: Complex gesture interactions on mobile

```javascript
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

// Swipe to acknowledge gesture
<PanGestureHandler
  onGestureEvent={gestureHandler}
  onHandlerStateChange={handleStateChange}
>
  <Animated.View style={[styles.alertCard, animatedStyle]}>
    <AlertContent />
  </Animated.View>
</PanGestureHandler>

const gestureHandler = useAnimatedGestureHandler({
  onStart: (_, ctx) => {
    ctx.startX = translateX.value;
  },
  onActive: (event, ctx) => {
    translateX.value = ctx.startX + event.translationX;
    // Visual feedback during swipe
    backgroundColor.value = interpolateColor(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      ['#FFFFFF', '#10B981']
    );
  },
  onEnd: () => {
    if (translateX.value > SWIPE_THRESHOLD) {
      translateX.value = withSpring(SCREEN_WIDTH);
      runOnJS(acknowledgeAlert)();
    } else {
      translateX.value = withSpring(0);
    }
  }
});
```

### 7. Rive (Cross-platform)
**Best for**: Designer-friendly animations, interactive states

```jsx
// React Native
import Rive from 'rive-react-native';

<Rive
  resourceName="emergency_alert"
  stateMachineName="AlertStates"
  autoplay={true}
  style={{ width: 300, height: 300 }}
  onStateChanged={(stateName) => {
    if (stateName === 'acknowledged') {
      handleAcknowledgment();
    }
  }}
/>

// Web
import { useRive } from '@rive-app/react-canvas';

const { RiveComponent, rive } = useRive({
  src: 'emergency-alert.riv',
  stateMachines: 'AlertStates',
  autoplay: true,
});
```

## 🎯 Animation Patterns for Healthcare

### 1. Urgency Indicators
```jsx
// Framer Motion - Escalating Alert
<motion.div
  animate={{
    backgroundColor: ['#FEF3C7', '#FEE2E2', '#FEF3C7'],
    scale: [1, 1.02, 1],
  }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>

// Reanimated - Shake for attention
const shake = useSharedValue(0);
shake.value = withSequence(
  withTiming(-10, { duration: 50 }),
  withTiming(10, { duration: 50 }),
  withTiming(-10, { duration: 50 }),
  withTiming(0, { duration: 50 })
);
```

### 2. Success Feedback
```jsx
// Lottie - Checkmark animation
const successAnimation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Success",
  layers: [/* ... */]
};

// Spring - Bounce effect
const success = useSpring({
  from: { scale: 0, rotate: -180 },
  to: { scale: 1, rotate: 0 },
  config: { mass: 3, tension: 400, friction: 40 }
});
```

### 3. Loading States
```jsx
// Framer Motion - Skeleton pulse
<motion.div
  animate={{
    opacity: [0.5, 1, 0.5],
    background: [
      'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)',
      'linear-gradient(90deg, #f8f8f8 0%, #f0f0f0 50%, #f8f8f8 100%)',
      'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)'
    ]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

### 4. Page Transitions
```jsx
// React Navigation + Reanimated
const slideFromRight = {
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};
```

## 🔧 Performance Optimization

### Mobile Performance Tips
1. **Use native driver** when possible
2. **Avoid animating layout properties** (use transform)
3. **Batch animations** with `Animated.parallel()`
4. **Use `InteractionManager`** for post-animation tasks
5. **Enable Hermes** for better performance

### Web Performance Tips
1. **Use CSS transforms** over position changes
2. **Enable GPU acceleration** with `will-change`
3. **Debounce scroll animations**
4. **Use `requestAnimationFrame`** for custom animations
5. **Lazy load animation libraries**

## 📚 Animation Resources

### Design Tools
- **After Effects + Bodymovin**: Create Lottie animations
- **Rive**: Interactive animation editor
- **Principle**: Interaction design
- **Figma + Figmotion**: Basic animations
- **Spline**: 3D web animations

### Code Examples
- [Framer Motion Examples](https://www.framer.com/motion/examples/)
- [React Native Reanimated Playground](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/playground/)
- [Lottie Files](https://lottiefiles.com/)
- [GSAP CodePen](https://codepen.io/GreenSock)

### Performance Monitoring
- React DevTools Profiler
- Chrome DevTools Performance tab
- React Native Flipper
- Why Did You Render

---

*Choose the right tool for the right job. Not every animation needs a heavy library.*