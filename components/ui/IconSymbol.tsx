// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';

import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'gearshape.fill': 'settings',
  'view-compact': 'view-compact',
  'view-comfortable': 'view-comfortable',
  'view-agenda': 'view-agenda',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'person.fill': 'person',
  'building.fill': 'business',
  'building.2.fill': 'domain',
  'lock.shield.fill': 'enhanced-encryption',
  'phone.fill': 'phone',
  'briefcase.fill': 'work',
  'doc.text.fill': 'description',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
