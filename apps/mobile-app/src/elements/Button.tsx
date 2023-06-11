import {Text, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {LinearGradient} from 'expo-linear-gradient';
import React from 'react';

const Button = styled(TouchableOpacity)`
  width: 100%;
  border-radius: 10px;
  height: 56px;
  flex: 1;
  overflow: hidden;
`;

const Container = styled(LinearGradient)`
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex: 1;
`;

const types = {
  primary: {
    flex: 1,
    backgroundColor: '#14A1E4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    flex: 1,
    backgroundColor: '#3b484f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
};

const colors = {
  primary: [
    '#4dcaf3',
    '#2ff1eb',
    '#2FBFF1',
    '#138bee',
    '#13b0ee',
    '#13b0ee',
    '#2ff1eb',
    '#4dcaf3',
  ],
  secondary: [
    '#222835',
    '#394358',
    '#222835',
    '#222835',
    '#31394a',
    '#313847',
    '#394358',
    '#222835',
  ],
};

export default ({
  type = 'primary',
  children = null,
  style = {},
  onPress = () => null,
}) => {
  return (
    <Button
      onPress={onPress}
      style={{
        ...(type ? types[type] : {}),
        ...style,
      }}>
      <Container
        colors={colors[type]}
        start={{x: 0.0, y: 0}}
        end={{x: 0, y: 1}}
        locations={[0, 0.0125, 0.1, 0.5, 0.8, 1 - 0.125, 1 - 0.0125, 1]}>
        {children ?? <></>}
      </Container>
    </Button>
  );
};
