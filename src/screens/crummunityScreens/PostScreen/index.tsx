import { View, Text, SafeAreaView, TouchableWithoutFeedback, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles'
import SkinnyPostCard from '../../../components/CrummunitySkinnyPost'
import { COLORS, FONTS, SIZES } from '../../../../assets/constants/theme'
import LinearGradient from 'react-native-linear-gradient'
import { Icon } from '@rneui/base'
import { RouteProp, useNavigation } from '@react-navigation/native'
import { CrummunityStackParams } from '../../../navigation/CrummunityStack'
import Header from '../../../components/header'
import TabContainer from '../../../components/TabContainer/TabContainer'
import { StackNavigationProp } from '@react-navigation/stack'
import { IUserProfile } from '../../../../types'

type PostScreenNavigationProp = StackNavigationProp<CrummunityStackParams, 'ViewUserScreen'>;

type PostScreenRouteProp = RouteProp<CrummunityStackParams, 'ViewUserScreen'>;

type Props = {
    navigation: PostScreenNavigationProp;
    route: PostScreenRouteProp;
};

const PostScreen = ({navigation, route}: Props) => {
   const author: IUserProfile | null = route.params?.author ?? null;
    const {post} = route.params;

    if (!post) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.AKCRUBACKGROUND,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Text style={{...FONTS.Title2Orange}}>Error: Post not found</Text>
            </View>
        );
    }

    return (
        <TabContainer>
            <SafeAreaView>
                <ScrollView stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 100}}>
                        <Header />
                    </View>
                    <View
                        style={{
                            height: SIZES.ScreenHeight * 0.15,
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
                                height: SIZES.ScreenHeight * 0.15,
                            }}>
                            <TouchableOpacity onPress={() => navigation.pop()}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: '20%',
                                        marginHorizontal: 15,
                                    }}>
                                    <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                    <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                </View>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                    <View style={styles.postcontainer}>
                        <SkinnyPostCard
                            post={post}
                            openProfile={() => navigation.navigate('ViewUserScreen', {userID: post.author?.id})}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </TabContainer>
    );
};
export default PostScreen;