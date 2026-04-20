import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../assets/constants';

export default StyleSheet.create({
    featuredSectionContainer: {
        marginTop: 10,
        marginHorizontal: '2%',
        paddingTop: 10,
        paddingBottom: 12,
        borderRadius: 14,
    },
    featuredTitle: {
        color: COLORS.WHITE,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 10,
    },
    /** Home (and shared) section title — use for all horizontal rows */
    homeSectionTitle: {
        color: COLORS.WHITE,
        fontSize: 22,
        fontWeight: '700',
        marginTop: 10,
        marginBottom: 8,
    },
    homeSectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: '2%',
    },
    homeSectionTitleIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    highlightCardWrap: {
        marginRight: 12,
    },
    featuredListContainer: {
        paddingVertical: 4,
    },
    featuredCardWrap: {
        alignItems: 'center',
    },
    featuredCardActive: {
        transform: [{scale: 1.04}],
    },
    featuredCardInactive: {
        transform: [{scale: 0.92}],
    },
    activeFeaturedFrame: {
        borderRadius: 14,
        padding: 2,
        shadowColor: '#B678FF',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.95,
        shadowRadius: 10,
        elevation: 14,
    },
    activeFeaturedInnerFrame: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: COLORS.BLACK,
    },
    featuredPoster: {
        width: SIZES.ScreenWidth / 2.9,
        height: SIZES.ScreenWidth / 2.05,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    /** Featured carousel — same aspect as legacy LargeListCategories / “Oldies” row */
    featuredWidePoster: {
        width: SIZES.ScreenWidth / 1.3,
        height: SIZES.ScreenWidth / 2.4,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    inactiveFeaturedOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
    poster: {
        width: SIZES.ScreenWidth / 3.6,
        height: SIZES.ScreenWidth / 2.4,
        borderRadius: 5,
        margin: 5,
        resizeMode: 'cover',
    },
});
