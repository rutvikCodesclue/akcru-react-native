import {Dimensions, PixelRatio} from 'react-native';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const fontScale = PixelRatio.getFontScale();
const getFontSize = (size: number) => size / fontScale;

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
    WHITE: '#FFFFFF',
    DARKORANGE: '#A74640',
    MIDORANGE: '#FE6345',
    LIGHTORANGE: '#F88163',
    DARKAKCRUBLUE: '#0A92C2',
    AKCRUBLUE: '#2FBFF1',
    TRANSAKCRUBLUE: '#2FBFF160',
    LIGHTGREY: '#E8E8E8',
    TRANSLIGHTGREY: '#E8E8E8A6',
    DARKGREY: '#A19C9C',
    DARKERGREY: '#464646',
    TRANSDARKGREY: '#525252A6',
    GREEN: '#09FF00',
    AKCRUBACKGROUND: '#0D182A',
    // PURPLE: '#FE50E5',
    PURPLE: '#6530FB',
    TRANSPURPLE: '#6530FB80',
    // TRANSPURPLE: '#FE50E580',
    BLACK: '#000000',
    FADEDBLACK: '#00000070',
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
    PINK: '#FF00FF',
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

const appTheme = {COLORS, SIZES, FONTS, AKCRUBADGES};

export default appTheme;
