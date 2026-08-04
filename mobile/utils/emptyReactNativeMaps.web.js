// Stub for react-native-maps on web. The real package imports native-only RN
// internals (codegenNativeCommands) and crashes Metro's web bundler outright.
// coverage-map.tsx (which uses the real react-native-maps) is never actually
// rendered on web — coverage-map.web.tsx is used instead — but Expo Router's
// file-based route registry eagerly bundles every route file regardless of
// platform, so this package still needs to resolve to *something* on web.
// Wired up via the custom resolver in metro.config.js.
function Noop() {
  return null;
}

export default Noop;
export const Circle = Noop;
export const Marker = Noop;
export const Polygon = Noop;
export const Polyline = Noop;
export const Callout = Noop;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
