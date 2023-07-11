import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
    flexDirection: 'row',
    borderWidth: 0.8,
    borderColor: COLORS.AKCRUBLUE,
    height: 60,
    borderRadius: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 6,
    zIndex: 20,
  },
  buttonText: {
    color: 'white',
  },
  accept: {
    ...FONTS.Title2,
    color: COLORS.CATGREENLGT,
  },
  decline: {
    ...FONTS.Title2,
    color: COLORS.CATREDLGT,
  },
});
