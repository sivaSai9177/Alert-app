#!/usr/bin/env bun

// Convert CSS HSL values to RGB hex colors
function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((v, i) => {
    const num = parseFloat(v);
    return i === 0 ? num : num / 100;
  });

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// TODO: Replace with structured logging - console.log('Theme Colors Test:');
// TODO: Replace with structured logging - console.log('Light Theme:');
// TODO: Replace with structured logging - console.log('  primary:', hslToHex('222.2 47.4% 11.2%'));
// TODO: Replace with structured logging - console.log('  primaryForeground:', hslToHex('210 40% 98%'));
// TODO: Replace with structured logging - console.log('  secondary:', hslToHex('210 40% 96%'));
// TODO: Replace with structured logging - console.log('  secondaryForeground:', hslToHex('222.2 84% 4.9%'));
// TODO: Replace with structured logging - console.log('  foreground:', hslToHex('222.2 84% 4.9%'));

// TODO: Replace with structured logging - console.log('\nDark Theme:');
// TODO: Replace with structured logging - console.log('  primary:', hslToHex('210 40% 98%'));
// TODO: Replace with structured logging - console.log('  primaryForeground:', hslToHex('222.2 47.4% 11.2%'));