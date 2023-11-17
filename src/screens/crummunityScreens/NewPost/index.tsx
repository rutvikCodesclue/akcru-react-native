import {View, Text, SafeAreaView, TouchableOpacity, TextInput} from 'react-native';
import React, { useState } from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {Avatar, Icon} from '@rneui/base';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import { selectAvatarBorderColor } from '../../../util/util';
import AkcruLevels from '../../../components/akcruBadges';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';

const NewPost = () => {
    const {user, hydrateUser} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            // This code will run when the screen comes into focus (e.g., when navigating to this screen)
            hydrateUser();
            return () => {
                // This code will run when the screen goes out of focus (e.g., when navigating away from this screen)
                hydrateUser();
            };
        }, []),
    );
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

    const [post, setPost] = useState('');



    const OnPostPress =()=> {
        console.log("Pressed Post Button", post)

        setPost('')
        navigation.goBack()
    }
    return (
        <SafeAreaView>
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
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: '20%',
                            marginHorizontal: 15,
                        }}>
                        <TouchableOpacity onPress={() => navigation.pop()}>
                            <View>
                                <Text style={{...FONTS.Title3, marginLeft: 5}}>Cancel</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={OnPostPress}
                            style={{marginLeft: 'auto'}}>
                            <View>
                                <Text style={styles.postButton}>Post</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
            <View style={{marginTop: '5%', marginHorizontal: 15}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginRight: 8}}>
                        <Avatar
                            rounded
                            size={40}
                            source={user?.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder}
                            avatarStyle={{
                                borderWidth: 2,
                                borderColor: selectAvatarBorderColor(user?.badge ?? 'AKCRUIT'),
                            }}
                        />
                    </View>
                    <View>
                        <Text style={{...FONTS.Title2, fontSize: 12}}>
                            {/* {FAKE_USER_PROFILES[0].userName} */}
                            {user ? user?.username : 'Guest'}
                        </Text>
                        {user?.badge === 'AKCRUIT' && (
                            <View>
                                <AkcruLevels.AkcruBadgeAkcruit />
                            </View>
                        )}
                        {user?.badge === 'GUARDIAN' && (
                            <View>
                                <AkcruLevels.AkcruBadgeGuardian />
                            </View>
                        )}
                        {user?.badge === 'HERO' && (
                            <View>
                                <AkcruLevels.AkcruBadgeHero />
                            </View>
                        )}
                        {user?.badge === 'SUPERHERO' && (
                            <View>
                                <AkcruLevels.AkcruBadgeSuperHero />
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.input}>
                    <TextInput
                        placeholder={'Tell us the "skinny" in 150 characters or less'}
                        placeholderTextColor={COLORS.DARKGREY}
                        style={styles.textinput}
                        secureTextEntry={false}
                        onChangeText={text => {
                            // Limit the description to 150 characters
                            if (text.length <= 200) {
                                setPost(text);
                            }
                        }}
                        value={post} // Use the modified value in the TextInput
                        multiline={true}
                        maxLength={200} // Set the maximum character limit
                        editable={true}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default NewPost;
