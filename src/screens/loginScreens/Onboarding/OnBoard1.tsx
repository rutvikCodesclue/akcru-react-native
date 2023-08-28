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
import InputsLrg from '../../../components/inputLrg';
import {Icon} from '@rneui/base';
import DateTimePicker from '@react-native-community/datetimepicker';
import {MaskedTextInput} from 'react-native-mask-text';

import {API} from '../../../clients/api.client';
import {supabase} from '../../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnBoard1 = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParams>>();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [dob, setDob] = useState('');
    const [userName, setUserName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    const [showPicker, setShowPicker] = useState(false);
    const [date, setDate] = useState<Date>(new Date());

    const toggleDatePicker = () => {
        setShowPicker(!showPicker);
    };

    const onChange = ({type} : {type: string}, selectedDate: Date ) => {
      if (type == "set") {
        const currentDate = selectedDate;
        setDate(currentDate);

        if (Platform.OS === 'android') {
          toggleDatePicker();
          setDob(currentDate.toDateString())
        }
      } else { toggleDatePicker()}
    };

    const confirmIOSDate = ({type}: {type: string}, selectedDate: Date) => {
        const currentDate = selectedDate;
        setDob(currentDate.toDateString());
        toggleDatePicker();
    };

    const handlePhoneNumberChange = (text: string) => {
        setPhoneNumber(text);
        
    };

    const handleFirstNameChange = (text: string) => {
        setFirstName(text);
    };

    const handleLastNameChange = (text: string) => {
        setLastName(text);
    };

    const handleDobChange = (text: string) => {
      setDob(text);
    };

    

    


    const checkFormCompletion = () => {
        if (
            userName &&
            dob 
        ) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    };

    useEffect(() => {
        checkFormCompletion();
       
    }, [
       
        // dob,
    ]);

    return (
        <View>
            <ScrollView>
                <ImageBackground style={styles.bgimage} source={imageindex.AkcruonboardBG} resizeMode={'cover'}>
                    <KeyboardAvoidingView behavior="padding" style={{flex: 1, marginBottom: 50}}>
                        <View style={styles.container}>
                            <View
                                style={{
                                    alignItems: 'flex-end',
                                }}>
                                <Text style={{...FONTS.Title3, marginRight: 20}}>1/3</Text>
                            </View>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <AkcruLogo width={200} height={60} />
                                <Text style={{...FONTS.Title2, textAlign: 'center'}}>
                                    We're excited to have you join our community. To provide you with a personalized
                                    experience, we kindly request some basic information. Don't worry, your privacy is
                                    important to us and your data will be handled securely.
                                </Text>
                            </View>

                            <View style={{alignItems: 'center', marginTop: 20}}>
                                <InputsLrg
                                    placeholdername={'First Name'}
                                    iconname={'person'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={handleFirstNameChange}
                                    value={firstName}
                                    editable={!loading}
                                />
                                <InputsLrg
                                    placeholdername={'Last Name'}
                                    iconname={'person'}
                                    iconcolor={COLORS.LIGHTGREY}
                                    secureTextEntry={false}
                                    onChangeText={handleLastNameChange}
                                    value={lastName}
                                    editable={!loading}
                                />

                                {showPicker && (
                                    <DateTimePicker
                                        display="spinner"
                                        mode="date"
                                        value={date}
                                        onChange={onChange}
                                        style={styles.datepicker}
                                    />
                                )}

                                {showPicker && Platform.OS === 'ios' && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-around',
                                        }}>
                                        <TouchableOpacity
                                            style={[styles.iosbutton, styles.iospickerbutton]}
                                            onPress={toggleDatePicker}>
                                            <Text style={{...FONTS.paragraph1, color: COLORS.BLACK}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iosbutton, styles.iospickerbutton]}
                                            onPress={confirmIOSDate}>
                                            <Text style={{...FONTS.paragraph1, color: COLORS.BLACK}}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {!showPicker && (
                                    <Pressable onPress={toggleDatePicker}>
                                        <InputsLrg
                                            placeholdername={'DOB'}
                                            iconname={'calendar'}
                                            iconcolor={COLORS.LIGHTGREY}
                                            secureTextEntry={false}
                                            onChangeText={handleDobChange}
                                            value={dob}
                                            editable={false}
                                            onPressIn={toggleDatePicker}
                                        />
                                    </Pressable>
                                )}
                                <View style={styles.input}>
                                    <Icon
                                        name={'call'}
                                        type="ionicon"
                                        size={20}
                                        color={COLORS.LIGHTGREY}
                                        style={{marginRight: 5}}
                                    />
                                    <MaskedTextInput
                                        mask="1+999-999-9999"
                                        placeholder="1+123-456-7890"
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.textinput}
                                        secureTextEntry={false}
                                        onChangeText={handlePhoneNumberChange}
                                        value={phoneNumber}
                                        keyboardType="phone-pad"
                                        editable={true}
                                    />
                                </View>
                            </View>

                            <View>
                                <View style={{alignItems: 'center', marginTop: 20}}>
                                    <AkcruButtons.XlLrgButton
                                        color={COLORS.AKCRUBLUE}
                                        btnname={'Next'}
                                        onPress={() => navigation.navigate('OnBoard2')}
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

export default OnBoard1;
