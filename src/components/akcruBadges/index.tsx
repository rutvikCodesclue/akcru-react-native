import {View, Text, Platform} from 'react-native';
import React from 'react';
import { FONTS, COLORS, SIZES, AKCRUBADGES } from '../../../assets/constants';

const AkcruBadgeGuardian = () => {
  return (
      <View>
          <View
              style={{
                  //   backgroundColor: AKCRUBADGES.Guardian.background,
                  //   paddingHorizontal: 10,
                //   height: 18,
                //   justifyContent: 'center',
                 
                  marginVertical: 5,
                  overflow: 'hidden', 
                  borderRadius: 5, 
                  
              }}>
              <Text
                  style={{
                      ...FONTS.Akcrubadges,
                      color: AKCRUBADGES.Guardian.color,
                      backgroundColor: AKCRUBADGES.Guardian.background,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                      paddingVertical: 2,
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
                 
                  marginVertical: 5,
                  
                  overflow: 'hidden', 
                  borderRadius: 5, 
              }}>
              <Text
                  style={{
                      ...FONTS.Akcrubadges,
                      color: AKCRUBADGES.SuperHero.color,
                      backgroundColor: AKCRUBADGES.SuperHero.background,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                      paddingVertical: 2,
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
                 
                  marginVertical: 5,
                    overflow: 'hidden', 
                    borderRadius: 5, 
                    
              }}>
              <Text
                  style={{
                      ...FONTS.Akcrubadges,
                      color: AKCRUBADGES.Hero.color,
                      backgroundColor: AKCRUBADGES.Hero.background,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                      paddingVertical: 2,
                  }}>
                  {AKCRUBADGES.Hero.label}
              </Text>
          </View>
      </View>
  );
};

const AkcruBadgeAkcruit = () => {
  return (
      
          <View
              style={{
               
                    marginVertical: 5,
                    overflow: 'hidden', 
                    borderRadius: 5, 
                    
                    
                    
              }}>
              <Text
                  style={{
                      ...FONTS.Akcrubadges,
                      color: AKCRUBADGES.Akcruit.color,
                      backgroundColor: AKCRUBADGES.Akcruit.background,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                      paddingVertical: 2,
                  }}>
                  {AKCRUBADGES.Akcruit.label}
              </Text>
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
