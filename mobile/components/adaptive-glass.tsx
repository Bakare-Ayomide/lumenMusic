import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useTheme } from "../theme/theme";

/** Fallback material when Liquid Glass is unavailable (older iOS, Android, web). */
const FALLBACK_BLUR_TINT = "systemChromeMaterial";
const FALLBACK_BLUR_INTENSITY = 80;

/**
 * Liquid Glass surface with a blur fallback. Previously reimplemented in
 * three places (Now Playing's `AdaptiveGlass`, the track-actions
 * `GlassCircle`, and the library header's `GlassSurface`); centralized here so
 * the fallback material stays consistent.
 *
 * The caller's `style` should include the shape (size, borderRadius,
 * `overflow: "hidden"`); children render inside the glass.
 */
export function AdaptiveGlass({
  children,
  style,
  interactive = false,
}: {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  interactive?: boolean;
}) {
  const theme = useTheme();
  // Paint above the native material: a background behind Liquid Glass does
  // not reliably tint it. Keep the scrim separate from press-feedback opacity.
  const surface = interactive && theme.scheme === "light" ? (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: StyleSheet.flatten(style)?.borderRadius,
          backgroundColor: theme.color.glassControlSurface,
          borderColor: theme.color.glassControlBorder,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
    />
  ) : null;

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView isInteractive={interactive} style={style}>
        {surface}
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      tint={FALLBACK_BLUR_TINT}
      intensity={FALLBACK_BLUR_INTENSITY}
      style={style}
    >
      {surface}
      {children}
    </BlurView>
  );
}
