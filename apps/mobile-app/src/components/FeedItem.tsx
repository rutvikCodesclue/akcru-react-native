import {random} from 'lodash';
import {Text, TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import thumbsDownIcon from '../assets/thumbs-down.png';
import thumbsUpIcon from '../assets/thumbs-up.png';
import Icon from '../elements/Icon';
import UserItem from './UserItem';

const Container = styled(View)`
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 16px;
  margin-bottom: 8px;
  width: 100%;
  background-color: #41415b53;
  border-radius: 12px;
`;

const Comment = styled(Text)`
  color: #ebebed;
  font-size: 15px;
  font-family: 'Montserrat-Regular';
  margin: 12px 0 4px 0;
  line-height: 27px;
  opacity: 0.72;
  padding: 5px;
  width: 100%;
`;

const Header = styled(View)`
  justify-content: space-between;
  width: 100%;
`;

const Actions = styled(View)`
  flex-direction: row;
  position: absolute;
  right: 0;
`;

const TouchButton = styled(TouchableOpacity)`
  border-radius: 6px;
  height: 49px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  margin: 0 6px;
  border: 1px solid transparent;
  color: #ebebed;
`;

const ButtonLabel = styled(Text)`
  font-size: 14px;
  font-family: 'Montserrat-SemiBold';
  color: #2fbff1;
  text-align: center;
  align-items: center;
  flex-direction: row;
`;

const MoreActions = styled(View)`
  width: 100%;
  flex-direction: row;
`;

export default ({item}) => {
  return (
    <Container>
      <Header>
        <UserItem user={item.user} />

        <Actions>
          <TouchButton
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 4,
            }}>
            <Icon style={{tintColor: '#ebebed'}} source={thumbsUpIcon} />
          </TouchButton>
          <TouchButton
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 10,
            }}>
            <Icon style={{tintColor: '#ebebed'}} source={thumbsDownIcon} />
          </TouchButton>
        </Actions>
      </Header>
      <Comment>{item.comment}</Comment>
      <MoreActions>
        <TouchButton
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 10,
            borderColor: 'transparent',
          }}>
          <ButtonLabel>Reply</ButtonLabel>
        </TouchButton>

        <TouchButton
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 10,
            borderColor: 'transparent',
          }}>
          <ButtonLabel>Send</ButtonLabel>
        </TouchButton>

        <TouchButton
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 10,
            borderColor: 'transparent',
            right: 0,
            position: 'absolute',
          }}>
          <ButtonLabel style={{color: '#FE50E5'}}>
            View {random(100)} comments
          </ButtonLabel>
        </TouchButton>
      </MoreActions>
    </Container>
  );
};
