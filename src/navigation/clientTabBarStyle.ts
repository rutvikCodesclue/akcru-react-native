import {Platform} from 'react-native';
import {COLORS} from '../../assets/constants';
import {isTablet} from '../../assets/constants/theme';

/** Shared with ClientTabNavigator — used to restore the bar after chat screens blur */
export const clientTabBarStyle = {
    position: 'absolute' as const,
    padding: 0,
    bottom: Platform.OS === 'ios' ? 50 : 10,
    height: isTablet() ? 80 : 60,
    borderRadius: 16,
    backgroundColor: COLORS.TRANSDARKGREY,
    borderTopColor: 'transparent' as const,
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
