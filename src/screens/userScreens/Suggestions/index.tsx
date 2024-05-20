import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert} from 'react-native';
import {Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../../assets/constants';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import useAuthStore from '../../../stores/auth.store';
import {sendReportToBackend} from '../../../lib/api/user.lib';
import ReportResultModal from '../../../components/ReportResultModal/ReportResultModal';
import BackButton from '../../../components/General/backbutton';

const Suggestions = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);

    const [description, setDescription] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

    const handleSubmitReport = async () => {
        const reportData = {
            email: user?.email,
            description: description,
            type: 'SUGGESTION',
            name: user?.firstName,
        };

        try {
            const {success, message} = await sendReportToBackend(reportData);
            if (success) {
                setModalType('success');
            } else {
                setModalType('failure');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Error', 'An error occurred while submitting the report.');
        } finally {
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        navigation.navigate('EditProfile');

        setDescription('');
        setModalVisible(false);
    };

    return (
        <TabContainer>
            <View style={{flex: 1}}>
                <ScrollView style={{flex: 1}} stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND, paddingBottom: 10}}>
                        <Header />
                        <BackButton navigation={navigation} />
                    </View>
                    <View>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, textAlign: 'center'}}>
                                SUGGESTIONS
                            </Text>
                            <View style={{width: '90%'}}>
                                <Text style={styles.instructionText}>
                                    Let us know what you think of the app and any suggestions you have for us.
                                </Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Let your voice be heard"
                                placeholderTextColor={COLORS.DARKGREY}
                                multiline
                                maxLength={500}
                                onChangeText={setDescription}
                                value={description}
                            />
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.sendReportButtonContainer}>
                    <AkcruButtons.LrgButton
                        btnname="Send Suggestion"
                        onPress={() => handleSubmitReport()}
                        color={description.length >= 3 ? COLORS.PURPLE : COLORS.DARKERGREY}
                        disabled={description.length < 3}
                    />
                </View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>
                    <ReportResultModal closeModal={closeModal} type={modalType} />
                </Modal>
            </View>
        </TabContainer>
    );
};

const styles = StyleSheet.create({
    instructionText: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        fontSize: 12,
        marginTop: 10,
        paddingBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
        color: COLORS.LIGHTGREY,
        width: '85%',
    },
    imagePickerButton: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    sendReportButtonContainer: {
        alignItems: 'center',
        paddingBottom: 20,
        width: '100%',
    },
});

export default Suggestions;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
