/**
 * Centralized auth UI themes for reuse across the app.
 * Import from: assets/constants/authTheme or @/assets/constants/authTheme
 */
import {COLORS, FONTS, SIZES, isTablet} from './theme';

// ----- Text theme -----
export const AUTH_TEXT_THEME = {
  /** Screen title (e.g. "Forgot your password?") */
  screenTitle: {
    ...FONTS.Title1,
    color: COLORS.PINK,
    marginTop: 30,
  },
  /** Subtitle below title (e.g. "Enter your phone number below") */
  subtitle: {
    ...FONTS.paragraph2,
    marginTop: 10,
  },
  /** Error / validation message */
  error: {
    ...FONTS.Title2,
    color: 'red',
    textAlign: 'center' as const,
  },
  /** Primary button label */
  buttonLabel: {
    ...FONTS.Title1,
    textAlign: 'center' as const,
    color: COLORS.WHITE,
  },
  /** Link text (e.g. "Enter your email instead") */
  link: {
    ...FONTS.Title1,
    color: COLORS.PINK,
    marginTop: 20,
  },
  /** Step indicator beside back button (e.g. "1/7") */
  stepIndicator: {
    ...FONTS.Title2,
    marginLeft: 4,
  },
  /** Instruction/body text, centered (onboard flow) */
  instruction: {
    ...FONTS.Title2,
    textAlign: 'center' as const,
  },
  /** Highlight text, pink, centered (onboard flow) */
  highlight: {
    ...FONTS.Title2,
    color: COLORS.PINK,
    textAlign: 'center' as const,
  },
  /** Inline link style (e.g. "terms and conditions") */
  linkSmall: {
    ...FONTS.Title2,
    color: COLORS.PINK,
  },
};

// ----- Button theme -----
export const AUTH_BUTTON_THEME = {
  colors: [COLORS.PURPLE, COLORS.PINK] as [string, string],
  start: {x: 0, y: 0},
  end: {x: 1, y: 0},
  borderRadius: 5,
  width: SIZES.ScreenWidth * 0.9,
  /** Use for button container height */
  getHeight: (): number => (isTablet() ? 60 : 45),
};

// ----- Text field theme (blur input wrapper + inner row) -----
const authInputHeight = isTablet() ? 60 : 45;

export const AUTH_TEXT_FIELD_THEME = {
  /** Outer wrapper (blur container) */
  width: SIZES.ScreenWidth * 0.9,
  borderRadius: 5,
  overflow: 'hidden' as const,
  marginVertical: 10,
  borderWidth: 1,
  borderColor: '#fff',
  minHeight: authInputHeight,
  /** Blur field wrapper: same as above with explicit height so BlurView fills a fixed area (match ForgotPassword). */
  getBlurWrapperStyle: () => ({
    width: SIZES.ScreenWidth * 0.9,
    borderRadius: 5,
    overflow: 'hidden' as const,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#fff',
    height: authInputHeight,
  }),
  /** Height for the inner input row (icon + TextInput) */
  getInputHeight: (): number => authInputHeight,
  /** Inner row style for single-line fields (use inside wrapper) */
  getInnerRowStyle: () => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'transparent',
    marginVertical: 0,
    borderWidth: 0,
    height: authInputHeight,
    paddingHorizontal: 12,
  }),
  /** Inner style for multiline fields (e.g. description). Use with AUTH_TEXT_FIELD_THEME as wrapper. */
  getMultilineInnerStyle: () => ({
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
    backgroundColor: 'transparent',
  }),
};

// ----- Hexagon theme -----
export const HEXAGON_THEME = {
  path: 'M202.5,0,270,117,202.5,234H67.5L0,117,67.5,0Z',
  viewBox: '0 0 270 234',
  fillColor: COLORS.AKCRUBLUE,
  /** Default size (width/height) for auth screens */
  defaultSize: isTablet() ? 200 : 150,
};
