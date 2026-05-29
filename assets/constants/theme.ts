import {Dimensions, PixelRatio, Platform} from 'react-native';
import {DefaultTheme as PaperDefaultTheme} from 'react-native-paper';
import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');
const aspectRatio = height / width;

export const isTablet = () => {
    const pixelDensity = PixelRatio.get();
    const adjustedWidth = width * pixelDensity;
    const adjustedHeight = height * pixelDensity;
    return (
        (Platform.OS === 'android' || Platform.OS === 'ios') &&
        (adjustedWidth >= 1000 || adjustedHeight >= 1000) &&
        aspectRatio <= 1.6
    );
};

const fontScale = PixelRatio.getFontScale();
const getFontSize = (size: number) => (isTablet() ? (size * 1.4) / fontScale : size / fontScale);

// Get the device's screen dimensions
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Based on the design's scale - Adjust these based on your design's base dimensions
const BASE_WIDTH = 375; // Example base width of your design
const BASE_HEIGHT = 667; // Example base height of your design

const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(scaleWidth, scaleHeight);

// Function to scale dimensions based on the screen size
const getAdaptiveSize = (size: number) => Math.ceil(size * scale);

// Example usage
const adaptiveHeight = getAdaptiveSize(15);

export const SIZES = {
    //screen size
    ScreenWidth,
    ScreenHeight,
    marginhorizontal: 15,
    marginvertical: 10,
    //element size
    SmallIcon: 23,
    MedIcon: 28,
    CatBtnSize: {
        width: 80,
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
    },
};

export const COLORS = {
    TRANSPARENT: 'transparent',
    WHITE: '#FFFFFF',
    WHITE_HEX_SHORT: '#fff',
    DARKORANGE: '#A74640',
    MIDORANGE: '#FE6345',
    LIGHTORANGE: '#F88163',
    DARKAKCRUBLUE: '#0A92C2',
    AKCRUBLUE: '#00bdf4',
    TRANSAKCRUBLUE: '#00bdf460',
//  AKCRUBLUE: '#2FBFF1',
//    TRANSAKCRUBLUE: '#2FBFF160',
    LIGHTGREY: '#E8E8E8',
    TRANSLIGHTGREY: '#E8E8E8A6',
    DARKGREY: '#A19C9C',
    DARKERGREY: '#464646',
    TRANSDARKGREY: '#525252A6',
    GREEN: '#09FF00',
    AKCRUBACKGROUND: '#050344',
    // PURPLE: '#FE50E5',
    PURPLE: '#6530fc',
    TRANSPURPLE: '#6530fc80',
 //PURPLE: '#6530FB',
   // TRANSPURPLE: '#6530FB80',
    // TRANSPURPLE: '#FE50E580',
    BLACK: '#000000',
    BLACK_HEX_SHORT: '#000',
    FADEDBLACK: '#00000070',
    SURFACE_ELEVATED: '#1C202A',
    OVERLAY_BLACK_90: 'rgba(0, 0, 0, 0.9)',
    OVERLAY_BLACK_85: 'rgba(0, 0, 0, 0.85)',
    OVERLAY_BLACK_60: 'rgba(0, 0, 0, 0.6)',
    OVERLAY_BLACK_55: 'rgba(0, 0, 0, 0.55)',
    OVERLAY_BLACK_52: 'rgba(0,0,0,0.52)',
    OVERLAY_BLACK_50: 'rgba(0, 0, 0, 0.5)',
    OVERLAY_BLACK_45: 'rgba(0,0,0,0.45)',
    OVERLAY_BLACK_40: 'rgba(0,0,0,0.4)',
    OVERLAY_BLACK_38: 'rgba(0,0,0,0.38)',
    OVERLAY_BLACK_35: 'rgba(0,0,0,0.35)',
    OVERLAY_WHITE_95: 'rgba(255,255,255,0.95)',
    OVERLAY_WHITE_92: 'rgba(255,255,255,0.92)',
    OVERLAY_WHITE_90: 'rgba(255,255,255,0.9)',
    OVERLAY_WHITE_88: 'rgba(255,255,255,0.88)',
    OVERLAY_WHITE_85: 'rgba(255,255,255,0.85)',
    OVERLAY_WHITE_82: 'rgba(255,255,255,0.82)',
    OVERLAY_WHITE_80: 'rgba(255,255,255,0.8)',
    OVERLAY_WHITE_75: 'rgba(255,255,255,0.75)',
    OVERLAY_WHITE_72: 'rgba(255,255,255,0.72)',
    OVERLAY_WHITE_70: 'rgba(255,255,255,0.7)',
    OVERLAY_WHITE_65: 'rgba(255,255,255,0.65)',
    OVERLAY_WHITE_60: 'rgba(255,255,255,0.6)',
    OVERLAY_WHITE_55: 'rgba(255,255,255,0.55)',
    OVERLAY_WHITE_50: 'rgba(255,255,255,0.5)',
    OVERLAY_WHITE_45: 'rgba(255,255,255,0.45)',
    OVERLAY_WHITE_40: 'rgba(255,255,255,0.4)',
    OVERLAY_WHITE_35: 'rgba(255,255,255,0.35)',
    OVERLAY_WHITE_30: 'rgba(255,255,255,0.3)',
    OVERLAY_WHITE_25: 'rgba(255,255,255,0.25)',
    OVERLAY_WHITE_22: 'rgba(255,255,255,0.22)',
    OVERLAY_WHITE_20: 'rgba(255,255,255,0.2)',
    OVERLAY_WHITE_18: 'rgba(255,255,255,0.18)',
    OVERLAY_WHITE_16: 'rgba(255,255,255,0.16)',
    OVERLAY_WHITE_15: 'rgba(255,255,255,0.15)',
    OVERLAY_WHITE_14: 'rgba(255,255,255,0.14)',
    OVERLAY_WHITE_12: 'rgba(255,255,255,0.12)',
    OVERLAY_WHITE_10: 'rgba(255,255,255,0.1)',
    OVERLAY_WHITE_08: 'rgba(255,255,255,0.08)',
    OVERLAY_WHITE_06: 'rgba(255,255,255,0.06)',
    OVERLAY_WHITE_05: 'rgba(255,255,255,0.05)',
    OVERLAY_WHITE_04: 'rgba(255,255,255,0.04)',
    OVERLAY_WHITE_03: 'rgba(255,255,255,0.03)',
    OVERLAY_WHITE_02: 'rgba(255,255,255,0.02)',
    PUREGOLD: '#DB9D00',
    STARGOLD: '#E99401',

    TAGCOLOR: '#222835',

    CATGREENDRK: '#004644',
    CATGREENLGT: '#07ADA7',
    CATPURPDRK: '#3A0046',
    CATPURPLGT: '#9007AD',
    // TRANSPURPLGT: '#9007AD70',
    TRANSPURPLGT: '#9007AD70',
    CATREDDRK: '#460000',
    CATREDLGT: '#AD0707',
    CATBLUEDRK: '#000946',
    CATBLUELGT: '#1207AD',
    PINK: '#dc1cd3',
    TRANSPINK: '#FF00FF50',
    AKCRUPINK: '#DB1DD0',
    BLACKCLOAK: '#504f57',
};

export const MULTISIZES = {
    small11: getAdaptiveSize(11),
    medium13: getAdaptiveSize(13),
    medium14: getAdaptiveSize(14),
    large15: getAdaptiveSize(15),
    Xlarge18: getAdaptiveSize(18),
    Xlarge20: getAdaptiveSize(20),
    Xlarge23: getAdaptiveSize(23),
    Xlarge25: getAdaptiveSize(25),
    Xlarge28: getAdaptiveSize(28),
    Xlarge40: getAdaptiveSize(40),
    Xlarge43: getAdaptiveSize(43),
    Xlarge60: getAdaptiveSize(60),
    Xlarge75: getAdaptiveSize(75),
    Xlarge80: getAdaptiveSize(80),
    Xlarge150: getAdaptiveSize(150),
};

export const FONTS = {
    Akcrubadges: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: getFontSize(12),
        color: COLORS.LIGHTGREY,
    },
    Title1: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: getFontSize(16),
        color: COLORS.LIGHTGREY,
    },
    Title2: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: getFontSize(14),
        color: COLORS.LIGHTGREY,
    },
    Username: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: getFontSize(12),
        color: COLORS.LIGHTGREY,
    },
    paragraph1: {
        fontFamily: 'Montserrat-Regular',
        fontSize: getFontSize(12),
        color: COLORS.LIGHTGREY,
    },
    paragraph2: {
        fontFamily: 'Montserrat-Regular',
        fontSize: getFontSize(14),
        color: COLORS.LIGHTGREY,
    },
    chart: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: getFontSize(10),
        color: COLORS.LIGHTGREY,
    },
    ContentTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: getFontSize(18),
        color: COLORS.LIGHTGREY,
    },
    Title3: {
        fontFamily: 'Montserrat-Bold',
        fontSize: getFontSize(14),
        color: COLORS.LIGHTGREY,
    },
    HeroTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: getFontSize(25),
        color: COLORS.LIGHTGREY,
    },
    Title2Orange: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: getFontSize(14),
        color: COLORS.DARKORANGE,
    },
    Title2White: {
        fontFamily: 'Montserrat-Medium',
        fontSize: getFontSize(14),
        color: COLORS.LIGHTGREY,
    },
    Title2AkcruBlue: {
        fontFamily: 'Montserrat-Medium',
        fontSize: getFontSize(12),
        color: COLORS.AKCRUBLUE,
    },
};

export const AKCRUBADGES = {
    Guardian: {
        badgeid: 'guardian',
        label: 'GUARDIAN',
        color: '#ED54ED',
        background: COLORS.CATPURPDRK,
    },
    Hero: {
        badgeid: 'hero',
        label: 'HERO',
        color: '#F88163',
        background: '#A74640',
    },
    SuperHero: {
        badgeid: 'superhero',
        label: 'SUPERHERO',
        color: '#5689FF',
        background: '#01003A',
    },
    Akcruit: {
        badgeid: 'ackruit',
        label: 'AKCRUIT',
        color: COLORS.AKCRUBLUE,
        background: '#076d91',
    },
};

export const THEME = {
    colors: {
        brand: {
            primary: COLORS.AKCRUBLUE,
            secondary: COLORS.PURPLE,
            accent: COLORS.PINK,
        },
        text: {
            primary: COLORS.LIGHTGREY,
            secondary: COLORS.DARKGREY,
            inverse: COLORS.BLACK,
        },
        background: {
            app: COLORS.AKCRUBACKGROUND,
            surface: COLORS.BLACK,
            card: COLORS.TAGCOLOR,
            overlay: COLORS.FADEDBLACK,
        },
        feedback: {
            success: COLORS.GREEN,
            warning: COLORS.MIDORANGE,
            error: COLORS.CATREDLGT,
        },
        border: {
            default: COLORS.TRANSDARKGREY,
            subtle: COLORS.TRANSLIGHTGREY,
        },
    },
    typography: FONTS,
    spacing: SIZES,
    badges: AKCRUBADGES,
} as const;

export const PAPER_THEME = {
    ...PaperDefaultTheme,
    colors: {
        ...PaperDefaultTheme.colors,
        primary: THEME.colors.brand.primary,
        secondary: THEME.colors.brand.secondary,
        background: THEME.colors.background.app,
        surface: THEME.colors.background.surface,
        text: THEME.colors.text.primary,
        error: THEME.colors.feedback.error,
    },
};

export const NAVIGATION_THEME = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        primary: THEME.colors.brand.primary,
        background: THEME.colors.background.app,
        card: THEME.colors.background.surface,
        text: THEME.colors.text.primary,
        border: THEME.colors.border.default,
    },
};

const appTheme = {COLORS, SIZES, FONTS, AKCRUBADGES, THEME, PAPER_THEME, NAVIGATION_THEME};

export default appTheme;
