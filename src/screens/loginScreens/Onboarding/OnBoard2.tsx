import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    Platform,
    KeyboardAvoidingView,
    Alert,
    TextInput,
    FlatList,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {AkcruLogo} from '../../../../assets/svg';
import imageindex from '../../../../assets/images/imageindex';
import {AuthStackParams} from '../../../navigation/AuthNavigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AkcruButtons from '../../../components/akcruButtons';
import { Avatar } from '@rneui/base';
import InputsLrg from '../../../components/inputLrg';
import {Icon} from '@rneui/base';

import {API} from '../../../clients/api.client';
import {supabase} from '../../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

const OnBoard2 = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();


    const [userName, setUserName] = useState('');
    const [response, setResponse] = React.useState<any>(null);

    const [isFormComplete, setIsFormComplete] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);




 



    const handleUserNameChange = (text: string) => {
        setUserName(text);
    };

    const checkFormCompletion = () => {
        if (userName ) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(
        () => {
            checkFormCompletion();
        },
        [
            // dob,
        ],
    );

    return (
        <View>
            <ScrollView>
                <ImageBackground style={styles.bgimage} source={imageindex.AkcruonboardBG} resizeMode={'cover'}>
                    <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                        <View style={styles.container}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <TouchableOpacity onPress={() => navigation.pop()} style={styles.backbutton}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                        <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                                        <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{
                                        alignItems: 'flex-end',
                                    }}>
                                    <Text style={{...FONTS.Title3, marginRight: 20}}>2/3</Text>
                                </View>
                            </View>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruLogo width={200} height={60} />
                            </View>
                            <View style={{alignItems: 'center', flexDirection: 'row', marginBottom: 20}}>
                                <View style={{marginRight: 10}}>
                                    <Avatar
                                        rounded
                                        size={75}
                                        source={imageindex.Akcruplaceholder}
                                        avatarStyle={{
                                            borderWidth: 2,
                                            borderColor: COLORS.AKCRUBLUE,
                                        }}
                                    />
                                </View>

                                <View>
                                    <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                        Begin by choosing an avatar photo
                                    </Text>
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                launchImageLibrary(
                                                    {
                                                        selectionLimit: 0,
                                                        mediaType: 'photo',
                                                        includeBase64: false,
                                                    },
                                                    setResponse,
                                                );
                                            }}>
                                            <Text
                                                style={{
                                                    ...FONTS.Title2AkcruBlue,
                                                    marginTop: 10,
                                                    color: COLORS.MIDORANGE,
                                                }}>
                                                Pick a profile photo
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                Now let's select a username that will be visible to other users. Additionally, provide
                                us with a brief description about yourself. This will help others get to know you better
                                and create meaningful connections within the community.
                            </Text>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <InputsLrg
                                    placeholdername={'Choose a username'}
                                    iconname={'person'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={handleUserNameChange}
                                    value={userName}
                                    editable={!loading}
                                />
                            </View>
                            <View style={styles.descinput}>
                                <TextInput
                                    placeholder={'Tell our crummunity about yourself...'}
                                    placeholderTextColor={COLORS.DARKGREY}
                                    style={styles.textinput}
                                    secureTextEntry={false}
                                    value={''}
                                />
                            </View>

                            <View>
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.XlLrgButton
                                        color={COLORS.AKCRUBLUE}
                                        btnname={'Next'}
                                        onPress={() => navigation.navigate('OnBoard3')}
                                        disabled={false}
                                    />
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ImageBackground>
            </ScrollView>
        </View>
    );
};

export default OnBoard2;
