import {StyleSheet} from 'react-native';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';

export default StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  post: {
    ...FONTS.paragraph1,
    fontSize: 12,
    lineHeight: 18
  },
  cardcontainer: {
    backgroundColor: '#1C202A',
    borderRadius: 5,
    padding: 10,
  },
  stamps: {
    ...FONTS.Title2Orange,
    marginBottom: 3,
  },
  stamps2: {
    ...FONTS.Title2AkcruBlue,
    fontSize: 14,
    color: COLORS.LIGHTGREY,
  },
  reply: {
    ...FONTS.Title1,
    color: COLORS.AKCRUBLUE,
    fontSize: 14,
  },
  viewreply: {
    ...FONTS.Title1,
    color: COLORS.CATPURPLGT,
    fontSize: 14,
  },
  postimage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginTop: 10
  }, 
  postfooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
