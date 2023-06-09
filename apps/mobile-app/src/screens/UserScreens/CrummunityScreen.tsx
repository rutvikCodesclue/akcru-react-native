import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';


import {useSelector} from 'react-redux';
import styled from 'styled-components/native';
import searchIcon from '../../assets/search.png';
import FeedItem from '../../components/FeedItem';
import PostBox from '../../components/PostBox';
import ScreenWrapper from '../ScreenWrapper';
import Icon from '../../elements/Icon';

const Wrapper = styled(SafeAreaView)`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  flex: 1;
  flex-direction: column;
  align-items: center;
  position: absolute;
  inset: 0;
`;

const Container = styled(View)`
  width: 100%;
  height: 100%;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Overlay = styled(View)`
  width: 100%;
  height: 100%;
  background-color: #100f1a;
  opacity: 0.49;
`;

const Title = styled(Text)`
  text-align: left;
  color: #ebebed;
  font-size: 14px;
  font-family: 'Montserrat-Bold';
  margin-bottom: 24px;
`;

const Top = styled(SafeAreaView)`
  align-items: flex-start;
  width: 100%;
  margin-top: 56px;
  padding: 16px 12px;
`;

const Search = styled(View)`
  background-color: #ebebed1a;
  width: 100%;
  flex-direction: row;
  border-radius: 8px;
  height: 49px;
  align-items: center;
  justify-content: center;
`;

const Textarea = styled(TextInput)`
  width: 100%;
  text-align: left;
  color: #ebebed;
  padding: 6px 12px;
  flex: 0.9;
  height: 100%;
`;

const IconButton = styled(TouchableOpacity)`
  position: absolute;
  right: 0;
  width: 36px;
  aspect-ratio: 1;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ScrollSection = styled(FlatList)`
  width: 100%;
  height: 100%;
`;

const Comments = styled(FlatList)`
  width: 100%;
  margin-top: 12px;
`;


const CrummunityScreen = () => {
  const {comments} = useSelector((state: any) => state.data);

  return (
<ScreenWrapper>
      <Wrapper>
        <Container>
          <Top>
            <Title>Crummunity Feed</Title>
            <Search>
              <Textarea
                textAlignVertical="top"
                placeholder="Search subscribers"
                placeholderTextColor="#ebebed75"
                multiline={true}></Textarea>
              <IconButton>
                <Icon style={{tintColor: '#2FBFF1'}} source={searchIcon} />
              </IconButton>
            </Search>
          </Top>

          <ScrollSection
            vertical
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate={'fast'}
            ListHeaderComponent={() => (
              <View
                style={{
                  marginVertical: 16,
                  marginHorizontal: 12,
                }}>
                <PostBox />
              </View>
            )}
            ListFooterComponent={() => {
              return (
                <View
                  style={{
                    marginVertical: 7,
                    marginHorizontal: 12,
                  }}>
                  <Comments
                    data={comments}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    vertical
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    snapToAlignment="start"
                    decelerationRate={'fast'}
                    renderItem={({item}) => {
                      return <FeedItem item={item} />;
                    }}
                  />
                </View>
              );
            }}></ScrollSection>
        </Container>
      </Wrapper>
      <Overlay />
    </ScreenWrapper>
  );
};

export default CrummunityScreen;
