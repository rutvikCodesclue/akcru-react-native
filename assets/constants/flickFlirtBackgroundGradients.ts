/**
 * Shared LinearGradient stops for Flick Flirt full-screen backgrounds (image + overlays).
 * Update here to change Results, Matches, PrefAll, ArchetypeResult, BlurredBackground, prefs, swipe, etc.
 */
export const FLICK_FLIRT_BG_BASE_COLORS = ['#0A0C2A', '#050723', '#02030F'] as const;

/** Full-height wash over the background image */
export const FLICK_FLIRT_IMAGE_OVERLAY_FULL_COLORS = [
    'rgba(5,7,35,0.7)',
    'rgba(5,7,35,0.2)',
    'rgba(5,7,35,0.92)',
] as const;

/** Bottom band fade into the scene */
export const FLICK_FLIRT_IMAGE_OVERLAY_BOTTOM_COLORS = [
    'rgba(5,7,35,0)',
    'rgba(5,7,35,0.55)',
    'rgba(5,7,35,0.9)',
    '#050723',
] as const;
