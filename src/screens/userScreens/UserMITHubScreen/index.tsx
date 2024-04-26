import {
    Text,
    View,
    ScrollView,
    ImageBackground,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StyleProp,
    ViewStyle,
    TextStyle,
    PressableAndroidRippleConfig,
    Pressable,
    useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';
import styles from './styles';
import { MITHubList } from '../../../components/MITHubComps';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { DIGITAL_PASS } from '../../../../assets/constants/Mockusers'
import { Icon, color } from '@rneui/base'
import { Route, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { UserProfileStackParams } from '../../../navigation/UserProfileStack';
import imageindex from '../../../../assets/images/imageindex';
import { StackNavigationProp } from '@react-navigation/stack'
import useAuthStore from '../../../stores/auth.store';

import {NavigationState, Scene, SceneRendererProps} from 'react-native-tab-view/lib/typescript/src/types';
import {TabView, SceneMap, TabBar, TabBarItemProps, TabBarIndicatorProps} from 'react-native-tab-view';
import MITReceived from '../UserMITHubTabs/MITReceived';
import MITSent from '../UserMITHubTabs/MITSent';
import TabContainer from '../../../components/TabContainer/TabContainer';
import AkcruButtons from '../../../components/akcruButtons';



type UserMITHubScreenNavigationProp = StackNavigationProp<
  UserProfileStackParams,
  "UserMITHubScreen"
>;

type UserMITHubScreenRouteProp = RouteProp<
  UserProfileStackParams,
  "UserMITHubScreen"
>;

type Props = {
  navigation: UserMITHubScreenNavigationProp;
  route: UserMITHubScreenRouteProp;
};

const FirstRoute = () => <MITReceived />;

const SecondRoute = () => <MITSent />;

const UserMITHubScreen = ({navigation, route}: Props) => {
  const { user, hydrateUser } = useAuthStore()

  useFocusEffect(
    React.useCallback(() => {
        // This code will run when the screen comes into focus (e.g., when navigating to this screen)
        hydrateUser()
        return () => {
          // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
          hydrateUser()
        };
    }, [])
  );

  const renderTabBar = (
      props: JSX.IntrinsicAttributes &
          SceneRendererProps & {
              navigationState: NavigationState<Route>;
              scrollEnabled?: boolean | undefined;
              bounces?: boolean | undefined;
              activeColor?: string | undefined;
              inactiveColor?: string | undefined;
              pressColor?: string | undefined;
              pressOpacity?: number | undefined;
              getLabelText?: ((scene: Scene<Route>) => string | undefined) | undefined;
              getAccessible?: ((scene: Scene<Route>) => boolean | undefined) | undefined;
              getAccessibilityLabel?: ((scene: Scene<Route>) => string | undefined) | undefined;
              getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined;
              renderLabel?: ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode) | undefined;
              renderIcon?: ((scene: Scene<Route> & {focused: boolean; color: string}) => React.ReactNode) | undefined;
              renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined;
              renderIndicator?: ((props: TabBarIndicatorProps<Route>) => React.ReactNode) | undefined;
              renderTabBarItem?:
                  | ((
                        props: TabBarItemProps<Route> & {key: string},
                    ) => React.ReactElement<any, string | React.JSXElementConstructor<any>>)
                  | undefined;
              onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined;
              onTabLongPress?: ((scene: Scene<Route>) => void) | undefined;
              tabStyle?: StyleProp<ViewStyle>;
              indicatorStyle?: StyleProp<ViewStyle>;
              indicatorContainerStyle?: StyleProp<ViewStyle>;
              labelStyle?: StyleProp<TextStyle>;
              contentContainerStyle?: StyleProp<ViewStyle>;
              style?: StyleProp<ViewStyle>;
              gap?: number | undefined;
              testID?: string | undefined;
              android_ripple?: PressableAndroidRippleConfig | undefined;
          },
  ) => (
      <TabBar
          {...props}
          indicatorStyle={{backgroundColor: COLORS.PURPLE}}
          scrollEnabled={false}
          tabStyle={{width: SIZES.ScreenWidth / 2}}
          labelStyle={{...FONTS.Title2, color: COLORS.LIGHTGREY}}
          style={{
              backgroundColor: COLORS.AKCRUBACKGROUND,
              justifyContent: 'space-between',
          }}
          contentContainerStyle={{
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
          }}
          activeColor={COLORS.PURPLE}
      />
  );

  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
      {key: 'first', title: `RECEIVED`},
      {key: 'second', title: `SENT`},
  ]);

  const renderScene = SceneMap({
      first: FirstRoute,
      second: SecondRoute,
  });
  
  return (
    <TabContainer>
        <SafeAreaView>
          <ScrollView stickyHeaderIndices={[0]}>
              <View>
                  <Header />
              </View>
              <View
                //   source={{uri: DIGITAL_PASS[0].SuperHeroPass}}
                //   resizeMode="cover"
                  style={{height: SIZES.ScreenHeight / 3.7, marginTop: "-15%"}}>
                  <LinearGradient
                      // Background Linear Gradient
                      colors={[COLORS.BLACK, COLORS.FADEDBLACK, COLORS.AKCRUBACKGROUND]}
                      style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          height: SIZES.ScreenHeight / 3.7,
                      }}
                  />
                  <View style={styles.topcontainer}>
                      <TouchableOpacity onPress={() => navigation.pop()}>
                          <View
                              style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                              }}>
                              <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                          </View>
                      </TouchableOpacity>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.screenTitle}>Movie Invite Ticket Hub</Text>
                          <Image source={imageindex.LrgMIT} style={{width: 55, height: 25}} />
                        </View> 
                        <TouchableOpacity 
                                onPress={()=>{
                                    navigation.navigate('ChatList');
                                }}
                        >
                       <Icon
                                                    name="chatbox-ellipses"
                                                    type="ionicon"
                                                    size={30}
                                                    color={COLORS.AKCRUBLUE}
                                                    style={{marginRight: 20}}
                                                />
                        </TouchableOpacity>
                      </View>
                  </View>

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
                                  size={25}
                                  style={{marginRight: 10}}
                              />
                              <Text style={{...FONTS.Title2, color: COLORS.DARKGREY}}>Find Users to Invite</Text>
                          </View>
                      </TouchableWithoutFeedback>
                  </View>
              </View>
              <View style={{}}>
                  
                  <View style={{flex: 1}}>
                      <TabView
                          navigationState={{index, routes}}
                          renderScene={renderScene}
                          onIndexChange={setIndex}
                          initialLayout={{width: layout.width}}
                          swipeEnabled={true}
                          renderTabBar={renderTabBar}
                      />
                  </View>
                  <View>
                      {index == 0 && <MITReceived />}
                      {index == 1 && (
                          <View>
                              <MITSent />
                          </View>
                      )}
                  </View>
              </View>
          </ScrollView>
      </SafeAreaView>
    </TabContainer>
      
  );
}

export default UserMITHubScreen
