import {Platform} from 'react-native';
import {COLORS} from '../../assets/constants';

/** Shared with ClientTabNavigator — used to restore the bar after nested screens hide it */
export const clientTabBarStyle = {
    /** Above in-scene bottom overlays (e.g. Crummunity floating post/poll strip uses zIndex 20) so tabs stay tappable */
    zIndex: 50,
    position: 'absolute' as const,
    paddingHorizontal: 0,
    /** Pull row up vs dead space above; keeps labels off the bottom rim of the pill */
    paddingTop: 0,
    paddingBottom: 10,
    /** Small lift from screen edge so navbar and home area don’t feel “stuck” together */
    bottom: Platform.OS === 'ios' ? 22 : 6,
    /** Pill height; keep room for center FAB lift so it is not clipped */
    height: 72,
    justifyContent: 'center' as const,
    borderRadius: 16,
    /** Must stay visible so `AkcruCenterButton` satellite hexes can animate above the pill */
    overflow: 'visible' as const,
    /** Frosted look comes from `tabBarBackground` BlurView; keep bar shell transparent */
    backgroundColor: COLORS.TRANSPARENT as const,
    borderWidth: 0 as const,
    borderTopWidth: 0 as const,
    borderTopColor: COLORS.TRANSPARENT as const,
    shadowColor: COLORS.FADEDBLACK,
    shadowOffset: {
        height: 6,
        width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: '3%' as const,
    alignSelf: 'center' as const,
};

/**
 * Vertical space the floating tab pill occupies from the physical bottom of the screen.
 * Use for `contentContainerStyle.paddingBottom` so scrollable content clears the bar
 * (`useBottomTabBarHeight()` often only reflects bar height, not `bottom` offset).
 */
export function getFloatingClientTabBarBottomInsetPx(extraGap = 18): number {
    return clientTabBarStyle.height + clientTabBarStyle.bottom + clientTabBarStyle.paddingBottom + extraGap;
}
