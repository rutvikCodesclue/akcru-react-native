import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import { FONTS,COLORS,SIZES } from '../../../assets/constants';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  btnname: string;
  onPress: () => void;
  color: string;
  disabled: boolean;
}


const SmallButton: React.FC<Props> = ({btnname, onPress, color, disabled}) => {
  return (
    <View>
      <TouchableOpacity
        style={{width: SIZES.ScreenWidth / 3, height: 40}}
        onPress={onPress}
        disabled={disabled}>
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            justifyContent: 'center',
            borderRadius: 5,
          }}>
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 40,
              borderRadius: 5,
            }}
          />
          <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const MedButton: React.FC<Props> = ({btnname, onPress, color, disabled}) => {
  return (
    <View>
      <TouchableOpacity
        style={{width: SIZES.ScreenWidth / 2.2, height: 40}}
        onPress={onPress}
        disabled={disabled}>
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            justifyContent: 'center',
            borderRadius: 5,
          }}>
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 40,
              borderRadius: 5,
            }}
          />
          <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const LrgButton: React.FC<Props> = ({btnname, onPress, color, disabled}) => {
  return (
    <View>
      <TouchableOpacity
        style={{width: SIZES.ScreenWidth / 1.5, height: 40}}
        onPress={onPress}
        disabled={disabled}>
        <View
          style={{
            flex: 1,
            backgroundColor: color,
            justifyContent: 'center',
            borderRadius: 5,
          }}>
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 40,
              borderRadius: 5,
            }}
          />
          <Text style={{...FONTS.Title1, textAlign: 'center'}}>{btnname}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const XSmallButton = ({btnname, onPress, disabled}: Props) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <View
          style={{
            backgroundColor: COLORS.AKCRUBLUE,
            height: 35,
            justifyContent: 'center',
            width: 90,
            borderRadius: 5,
            alignItems: 'center',
          }}>
          <LinearGradient
            // Background Linear Gradient
            colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 35,
              borderRadius: 5,
            }}
          />
          <Text style={{...FONTS.Title2}}>{btnname}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const AkcruButtons = {
  SmallButton,
  MedButton,
  LrgButton,
  XSmallButton,
};

export default AkcruButtons;
