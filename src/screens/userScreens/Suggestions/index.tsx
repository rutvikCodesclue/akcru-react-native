import React, {useState} from 'react';
import {View, Text, TextInput, ScrollView, StyleSheet, Modal, Alert} from 'react-native';
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
            <View style={styles.screenRoot}>
                <ScrollView style={styles.scrollRoot} contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[0]}>
                    <View style={styles.headerWrap}>
                        <Header />
                        <BackButton navigation={navigation} />
                    </View>
                    <View style={styles.container}>
                        <Text style={styles.title}>SUGGESTIONS</Text>
                        <Text style={styles.instructionText}>
                            Let us know what you think of the app and any suggestions you have for us.
                        </Text>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Your suggestion</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Let your voice be heard"
                                placeholderTextColor={COLORS.DARKGREY}
                                multiline
                                maxLength={500}
                                onChangeText={setDescription}
                                value={description}
                            />
                            <Text style={styles.charCount}>{description.length}/500</Text>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.sendReportButtonContainer}>
                    <AkcruButtons.LrgButton
                        btnname="Send Suggestion"
                        onPress={() => handleSubmitReport()}
                        variant="auth"
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
    screenRoot: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollRoot: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    headerWrap: {
        zIndex: 20,
        backgroundColor: COLORS.BLACK,
        paddingBottom: 10,
    },
    container: {
        marginHorizontal: '3%',
    },
    title: {
        ...FONTS.Title2,
        color: COLORS.AKCRUBLUE,
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginTop: 6,
        marginBottom: 6,
    },
    instructionText: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        fontSize: 12,
        marginTop: 6,
        paddingBottom: 10,
    },
    sectionCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_10,
        backgroundColor: COLORS.OVERLAY_WHITE_03,
        padding: 12,
        marginTop: 10,
    },
    sectionTitle: {
        ...FONTS.Title2,
        color: COLORS.PINK,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(211,211,211,0.35)',
        borderRadius: 10,
        padding: 10,
        marginTop: 4,
        marginBottom: 8,
        minHeight: 100,
        textAlignVertical: 'top',
        color: COLORS.LIGHTGREY,
        width: '100%',
        textAlign: 'left',
        backgroundColor: COLORS.OVERLAY_BLACK_35,
    },
    charCount: {
        ...FONTS.paragraph2,
        color: COLORS.DARKGREY,
        textAlign: 'right',
    },
    imagePickerButton: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    sendReportButtonContainer: {
        alignItems: 'center',
        paddingBottom: 16,
        paddingTop: 8,
        backgroundColor: COLORS.BLACK,
        width: '100%',
    },
});

export default Suggestions;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
