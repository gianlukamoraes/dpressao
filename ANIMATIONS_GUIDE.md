# Animations & Polish Guide

## Overview

This guide covers all animation utilities, components, and patterns used in dPressão to create a polished, delightful user experience while maintaining the "Honest Data" aesthetic.

---

## Animation Utilities

### `src/utils/animations.ts`

Core animation creators:

#### 1. **Fade-In Animation**
```typescript
import { createFadeInAnimation } from '../utils/animations';

const opacity = createFadeInAnimation(delay = 100);

// Use with Animated.View
<Animated.View style={{ opacity }}>
  Content fades in
</Animated.View>
```

#### 2. **Scale-In Animation**
```typescript
const scale = createScaleInAnimation(delay = 100);

// Use with transform
<Animated.View style={{
  transform: [{ scale }]
}}>
  Content scales up
</Animated.View>
```

#### 3. **Slide-Up Animation**
```typescript
const translateY = createSlideUpAnimation(delay = 100);

<Animated.View style={{
  transform: [{ translateY }]
}}>
  Content slides up
</Animated.View>
```

#### 4. **Fade + Scale (Combined)**
```typescript
const { opacity, scale } = createFadeScaleInAnimation(delay = 100);

<Animated.View style={{
  opacity,
  transform: [{ scale }]
}}>
  Content fades in AND scales up
</Animated.View>
```

#### 5. **Pulse Animation** (Loading/Emphasis)
```typescript
const opacity = createPulseAnimation();

<Animated.View style={{ opacity }}>
  Pulses continuously
</Animated.View>
```

#### 6. **Staggered Delays** (For Lists)
```typescript
import { getStaggeredDelay } from '../utils/animations';

{items.map((item, index) => (
  <AnimatedCard key={index} delay={getStaggeredDelay(index, 100)}>
    {item}
  </AnimatedCard>
))}
```

---

## Animated Components

### 1. **AnimatedCard**
Auto-animates on mount with fade + scale.

```typescript
import { AnimatedCard } from '../components/AnimatedCard';

<AnimatedCard delay={100}>
  <View style={styles.card}>
    Content here
  </View>
</AnimatedCard>
```

For lists with staggered animation:
```typescript
import { AnimatedCardList } from '../components/AnimatedCard';

<AnimatedCardList baseDelay={50}>
  {readingCards}
</AnimatedCardList>
```

### 2. **AnimatedNumber**
Numbers count from 0 to final value.

```typescript
import { AnimatedNumber } from '../components/AnimatedNumber';

// In HomeScreen for BP value
<AnimatedNumber
  value={145}
  duration={800}
  style={styles.largeNumber}
/>
```

### 3. **LoadingSkeleton**
Pulse animation while loading.

```typescript
import { LoadingSkeleton, LoadingCardSkeleton } from '../components/LoadingSkeleton';

// Generic skeleton
<LoadingSkeleton width="100%" height={48} />

// Pre-built card skeleton
<LoadingCardSkeleton />

// List of skeletons
<LoadingSkeletonList count={5} />
```

### 4. **SwipeableCard**
Swipe left to reveal delete button.

```typescript
import { SwipeableCard } from '../components/SwipeableCard';

<SwipeableCard 
  onDelete={() => deleteReading(id)}
  deleteLabel="🗑️ Deletar"
>
  <ReadingCardContent />
</SwipeableCard>
```

---

## Haptic Feedback

### `src/utils/haptics.ts`

Tactile feedback for interactions.

```typescript
import { 
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticWarning,
  hapticError,
  hapticSelection
} from '../utils/haptics';

// Light feedback for subtle interactions
<TouchableOpacity onPress={() => {
  hapticLight();
  toggleSetting();
}}>
  Toggle
</TouchableOpacity>

// Heavy feedback for important actions
<TouchableOpacity onPress={() => {
  hapticHeavy();
  saveReading();
}}>
  Save
</TouchableOpacity>

// Success feedback
onSave={() => {
  hapticSuccess();
  navigateAway();
}}

// Warning feedback (e.g., delete action)
onDelete={() => {
  hapticWarning();
  deleteReading();
}}
```

---

## Dark Mode

### Using Theme Context

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { isDark, colors, setTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current mode: {isDark ? 'Dark' : 'Light'}
      </Text>
      
      <TouchableOpacity onPress={() => setTheme('dark')}>
        <Text>Switch to Dark</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Theme Modes
- `'light'` - Always light theme
- `'dark'` - Always dark theme
- `'system'` - Follows device preference (default)

### Available Colors
Both light and dark themes have:
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.background` - Screen background
- `colors.surface` - Card background
- `colors.border` - Borders
- All medical status colors (normal, elevated, etc.)

---

## Integration Examples

### HomeScreen with Animations

```typescript
import { AnimatedCard } from '../components/AnimatedCard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { hapticMedium } from '../utils/haptics';

function HomeScreen() {
  return (
    <ScrollView>
      {/* Header with fade-in */}
      <AnimatedCard delay={0}>
        <Text style={styles.greeting}>Hello 👋</Text>
      </AnimatedCard>

      {/* Latest reading card */}
      <AnimatedCard delay={100}>
        <TouchableOpacity 
          onPress={() => {
            hapticMedium();
            navigate('Detail');
          }}
        >
          <AnimatedNumber value={145} style={styles.bpValue} />
        </TouchableOpacity>
      </AnimatedCard>

      {/* Recent readings with staggered animation */}
      <AnimatedCardList baseDelay={100}>
        {recentReadings.map(reading => (
          <ReadingCard key={reading.id} reading={reading} />
        ))}
      </AnimatedCardList>
    </ScrollView>
  );
}
```

### HistoryScreen with Loading States

```typescript
import { LoadingCardSkeleton } from '../components/LoadingSkeleton';

function HistoryScreen() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReadings().then(() => setLoading(false));
  }, []);

  return (
    <FlatList
      data={loading ? [1, 2, 3] : readings}
      renderItem={({ item }) => 
        loading ? (
          <LoadingCardSkeleton />
        ) : (
          <SwipeableCard onDelete={() => deleteReading(item.id)}>
            <ReadingCard reading={item} />
          </SwipeableCard>
        )
      }
    />
  );
}
```

---

## Animation Best Practices

### 1. **Timing**
- Entry animations: 500-600ms
- Loading pulses: 1000-1200ms
- Micro-interactions: 200-300ms
- Use delays for staggered effects: 50-100ms between items

### 2. **Performance**
- Use `useNativeDriver: true` when possible
- Animate only opacity and transform (hardware-accelerated)
- Avoid animating layout or size changes
- Use `LoadingSkeleton` instead of spinners (lower CPU)

### 3. **User Experience**
- Add haptic feedback for important actions
- Keep animations fast (don't annoy users)
- Provide visual feedback for all interactions
- Use animations to guide attention, not distract

### 4. **Accessibility**
- Respect `prefers-reduced-motion` (if implementing)
- Don't rely on animations alone to communicate (use text/icons)
- Ensure animations don't create flashing/strobing (seizure risk)

---

## Checklist for Polish

- [ ] Cards fade in on screen load
- [ ] Numbers animate from 0 to value
- [ ] List items stagger on load
- [ ] Loading states show skeletons (not spinners)
- [ ] Delete actions trigger warning haptic
- [ ] Important saves trigger success haptic
- [ ] Swipe-to-delete on reading cards
- [ ] Dark mode toggle in settings
- [ ] Smooth transitions between screens
- [ ] Haptic feedback on all major interactions

---

## File Structure

```
src/
├── utils/
│   ├── animations.ts      # Core animation creators
│   └── haptics.ts         # Haptic feedback utilities
├── components/
│   ├── AnimatedCard.tsx   # Card with fade+scale
│   ├── AnimatedNumber.tsx # Counting number animation
│   ├── LoadingSkeleton.tsx # Pulse loading state
│   └── SwipeableCard.tsx  # Swipe-to-delete gesture
├── hooks/
│   └── useAnimationOnMount.ts # Custom hooks for animations
├── context/
│   └── ThemeContext.tsx   # Light/dark mode provider
└── theme/
    └── index.ts           # Color/spacing/typography + colorsDark
```

---

## Next Steps

1. **Wrap App with ThemeProvider** in `App.tsx`
2. **Replace cards** with `SwipeableCard` in `ReadingCard.tsx`
3. **Add AnimatedNumber** to BP displays in `HomeScreen.tsx`
4. **Use LoadingSkeleton** in loading states
5. **Add haptic feedback** to all button interactions
6. **Test on real devices** for animation smoothness
