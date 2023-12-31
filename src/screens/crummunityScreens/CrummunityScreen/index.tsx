import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  ImageBackground,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Header from '../../../components/header';
import AkcruButtons from '../../../components/akcruButtons';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { CrummunityStackParams } from '../../../navigation/CrummunityStack';
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost';
import skinnies from '../../../../assets/constants/SkinnyPost';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { getPosts } from '../../../lib/api/post.lib';
import { IUserProfile } from '../../../../types';


const CrummunityScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

    // const handlePostPress = (post) => {
    //     navigation.navigate('PostScreen', {post});
    // };

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                console.log('fetchedPosts rightnow', fetchedPosts);
                setPosts(fetchedPosts);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            }
        };

        fetchPosts();
    }, []);

    const handlePostPress = (postId) => {
        const selectedPost = skinnies.find(post => post.id === postId);

        if (selectedPost) {
            navigation.navigate('PostScreen', {post: selectedPost});
        } else {
            // Handle the case when the post is not found
            console.error('Error: Post not found');
        }
    };

  return (
      <TabContainer>
          <SafeAreaView>
              <View>
                  <ScrollView stickyHeaderIndices={[0]} style={{height: SIZES.ScreenHeight}}>
                      <View>
                          <View style={{zIndex: 100}}>
                              <Header />
                          </View>
                          <View
                              style={{
                                  height: SIZES.ScreenHeight * 0.26,
                                  marginTop: -68,
                                  backgroundColor: COLORS.AKCRUBACKGROUND,
                              }}>
                              <LinearGradient
                                  // Background Linear Gradient
                                  colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                                  style={{
                                      position: 'absolute',
                                      left: 0,
                                      right: 0,
                                      top: 0,
                                      height: SIZES.ScreenHeight * 0.26,
                                  }}
                              />
                              <Text style={styles.screenTitle}>What's the Skinny?</Text>

                              <View style={{alignItems: 'center'}}>
                                  <TouchableWithoutFeedback
                                      onPress={() => {
                                          navigation.navigate('UserSearchResultScreen');
                                      }}>
                                      <View style={styles.searchinput}>
                                          <Icon
                                              name="magnify"
                                              type="material-community"
                                              color={COLORS.AKCRUBLUE}
                                              size={28}
                                              style={{marginRight: 10}}
                                          />
                                          <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Search users</Text>
                                      </View>
                                  </TouchableWithoutFeedback>
                              </View>
                              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                  <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, marginRight: 10}}>
                                      Crummunity Feed
                                  </Text>
                                  <Icon
                                      name="account-group"
                                      type="material-community"
                                      color={COLORS.MIDORANGE}
                                      size={25}
                                  />
                              </View>
                          </View>
                      </View>
                      <View style={{marginBottom: '30%'}}>
                          <FlatList
                              data={posts}
                              renderItem={({item}) => {
                                  return (
                                      <View>
                                          <Pressable onPress={() => handlePostPress(item.id)}>
                                              <View style={styles.postcontainer}>
                                                  <SkinnyPostCard post={item} />
                                              </View>
                                          </Pressable>
                                      </View>
                                  );
                              }}
                          />
                      </View>
                  </ScrollView>
                  <Pressable style={styles.floatingbutton} onPress={() => navigation.navigate('NewPost')}>
                      <Icon name="add" type="ionicon" color={COLORS.MIDORANGE} size={45} />
                  </Pressable>
              </View>
          </SafeAreaView>
      </TabContainer>
  );
};

export default CrummunityScreen;
