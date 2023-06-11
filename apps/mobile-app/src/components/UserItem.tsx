import {Text, View, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import UserAvatar from './UserAvatar';
import {useNavigation} from '@react-navigation/native';

const Container = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
`;

const Name = styled(Text)`
  color: #ebebed;
  font-family: 'Montserrat-SemiBold';
  font-size: 15px;
`;

const BadgeContainer = styled(Text)`
  margin: 3px 2px;
  background-color: #ebebed17;
  border-radius: 4px;
  padding: 3px 7px;
  overflow: hidden;
`;

const Badge = styled(Text)`
  text-align: center;
  color: #ebebed;
  font-size: 11px;
  font-family: 'Montserrat-SemiBold';
  text-transform: uppercase;
`;

export default ({
  user,
  imgSize = 49,
  imgSrc = '',
  orientation = 'horizontal',
}) => {
  const navigation = useNavigation();

  return (
    <Container
      style={{
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      }}
      onPress={() => navigation.navigate('profile-visit', {user})}>
      <UserAvatar imgSize={imgSize} imgSrc={user?.avatar} />
      <View
        style={{
          paddingHorizontal: 12,
        }}>
        <Name
          style={{
            paddingHorizontal: 12,
            marginBottom: 6,
          }}>
          {user?.name}
        </Name>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 10,
          }}>
          <BadgeContainer style={{backgroundColor: user.badge.bg}}>
            <Badge style={{color: user.badge.color}}>{user.badge.label}</Badge>
          </BadgeContainer>
        </View>
      </View>
    </Container>
  );
};
