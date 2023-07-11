import {View, Text} from 'react-native';
import React from 'react';
import { FONTS, COLORS, SIZES, AKCRUBADGES } from '../../../assets/constants';

const AkcruBadgeGuardian = () => {
  return (
    <View>
      <View
        style={{
          backgroundColor: AKCRUBADGES.Guardian.background,
          width: 95,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 5,
          marginBottom: 10,
          marginTop: 5,
        }}>
        <Text
          style={{
            ...FONTS.Title1,
            fontSize: 12,
            color: AKCRUBADGES.Guardian.color,
          }}>
          {AKCRUBADGES.Guardian.label}
        </Text>
      </View>
    </View>
  );
};

const AkcruBadgeSuperHero = () => {
  return (
    <View>
      <View
        style={{
          backgroundColor: AKCRUBADGES.SuperHero.background,
          width: 95,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 5,
          marginBottom: 10,
          marginTop: 5,
        }}>
        <Text
          style={{
            ...FONTS.Title1,
            fontSize: 12,
            color: AKCRUBADGES.SuperHero.color,
          }}>
          {AKCRUBADGES.SuperHero.label}
        </Text>
      </View>
    </View>
  );
};

const AkcruBadgeHero = () => {
  return (
    <View>
      <View
        style={{
          backgroundColor: AKCRUBADGES.Hero.background,
          width: 95,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 5,
          marginBottom: 10,
          marginTop: 5,
        }}>
        <Text
          style={{
            ...FONTS.Title1,
            fontSize: 12,
            color: AKCRUBADGES.Hero.color,
          }}>
          {AKCRUBADGES.Hero.label}
        </Text>
      </View>
    </View>
  );
};

const AkcruBadgeAkcruit = () => {
  return (
    <View>
      <View
        style={{
          backgroundColor: AKCRUBADGES.Akcruit.background,
          width: 95,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 5,
          marginBottom: 10,
          marginTop: 5,
        }}>
        <Text
          style={{
            ...FONTS.Title1,
            fontSize: 12,
            color: AKCRUBADGES.Akcruit.color,
          }}>
          {AKCRUBADGES.Akcruit.label}
        </Text>
      </View>
    </View>
  );
};

const AkcruLevels = {
  AkcruBadgeSuperHero,
  AkcruBadgeHero,
  AkcruBadgeAkcruit,
  AkcruBadgeGuardian,
};

export default AkcruLevels;
