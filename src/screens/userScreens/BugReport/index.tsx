import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
    Image,
    Modal,
    Alert,
    Pressable,
} from 'react-native';
import {Icon} from '@rneui/base';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {launchImageLibrary} from 'react-native-image-picker';
import {MediaType} from 'react-native-image-picker';
import useAuthStore from '../../../stores/auth.store';
import {sendReportToBackend, uploadImages} from '../../../lib/api/user.lib';
import ReportResultModal from '../../../components/ReportResultModal/ReportResultModal';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';
import BackButton from '../../../components/General/backbutton';

const BugReport = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);

    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

    const [showImageCountErrorModal, setShowImageCountErrorModal] = useState(false);

    const selectPostImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 3,
        };

        launchImageLibrary(options, response => {

            if (response && !response.didCancel && response.assets) {
                const uris = response.assets.map(asset => asset.uri);
                setSelectedImages(prevImages => [...prevImages, ...uris]);
            }
        });
    };

    const handleSubmitReport = async () => {
        let uploadedImageUrls: string[] = [];
        if (selectedImages.length > 0) {
            const uploadResponses = await uploadImages(selectedImages);

            if (uploadResponses && uploadResponses.success) {
                uploadedImageUrls = uploadResponses.content;
            } else {
                Alert.alert('Error', 'Failed to upload images.');
                return;
            }
        }

        const reportData = {
            email: user?.email,
            description: description,
            type: 'BUG',
            name: user?.firstName,
            imageURL: uploadedImageUrls,
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
        setSelectedImages([]);
        setModalVisible(false);
    };

    const removeFromUpload = async imageUri => {

        const updatedImages = selectedImages.filter(img => img !== imageUri);
        setSelectedImages(updatedImages);
    };

    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageEnlarge = imageUri => {
        setSelectedImage(imageUri);
        setEnlargeModalVisible(true);
    };

    const [enlargeModalVisible, setEnlargeModalVisible] = useState(false);

    const toggleEnlargeModal = () => {
        setEnlargeModalVisible(!enlargeModalVisible);
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
                        <Text style={styles.title}>BUG REPORT</Text>
                        <Text style={styles.instructionText}>
                            Please fill in the form below to report a bug you've encountered.
                        </Text>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Describe the issue</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a brief description of the bug you encountered"
                                placeholderTextColor={COLORS.DARKGREY}
                                multiline
                                maxLength={500}
                                onChangeText={setDescription}
                                value={description}
                            />
                            <Text style={styles.charCount}>{description.length}/500</Text>
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Screenshot (optional)</Text>
                            <Text style={styles.instructionSubText}>Add screenshots so we can diagnose faster.</Text>
                            <View style={{alignItems: 'center', paddingBottom: 6}}>
                            {selectedImages ? (
                                <View style={styles.gallerycontainer}>
                                    <FlatList
                                        data={selectedImages}
                                        numColumns={3}
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({item}) => (
                                            <View>
                                                <Pressable onPress={() => handleImageEnlarge(item)}>
                                                    <Image source={{uri: item}} style={styles.galleryImage} />
                                                </Pressable>
                                            </View>
                                        )}
                                    />
                                </View>
                            ) : null}
                            </View>

                            <TouchableOpacity onPress={selectPostImage} style={styles.imagePickerButton}>
                                <Icon name="images-outline" type="ionicon" color={COLORS.AKCRUBLUE} size={22} />
                                <Text style={styles.imagePickerText}>Attach screenshots</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.sendReportButtonContainer}>
                    <AkcruButtons.LrgButton
                        btnname="Send Report"
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
                <Modal animationType="fade" transparent={true} visible={!!showImageCountErrorModal}>
                    <ErrorModal
                        closeModal={() => setShowImageCountErrorModal(false)}
                        message={'You cannot upload more than 6 images.'}
                        iconcolor={COLORS.CATREDLGT}
                        iconname={'alert-circle'}
                    />
                </Modal>
                <Modal animationType="fade" transparent={true} visible={!!enlargeModalVisible}>
                    <EnlargeGalleryModal
                        closeModal={toggleEnlargeModal}
                        image={selectedImage}
                        deleteImage={removeFromUpload}
                    />
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
        marginHorizontal: SIZES.ScreenWidth * 0.03,
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
    instructionSubText: {
        ...FONTS.paragraph2,
        color: COLORS.LIGHTGREY,
        textAlign: 'left',
        marginBottom: 8,
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
        backgroundColor: COLORS.OVERLAY_BLACK_35,
        textAlign: 'left',
    },
    charCount: {
        ...FONTS.paragraph2,
        color: COLORS.DARKGREY,
        textAlign: 'right',
    },
    imagePickerButton: {
        alignSelf: 'flex-start',
        marginTop: 6,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'rgba(52,152,219,0.45)',
        backgroundColor: 'rgba(52,152,219,0.1)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePickerText: {
        ...FONTS.paragraph2,
        color: COLORS.AKCRUBLUE,
        marginLeft: 6,
    },
    sendReportButtonContainer: {
        alignItems: 'center',
        paddingBottom: 16,
        paddingTop: 8,
        backgroundColor: COLORS.BLACK,
        width: '100%',
    },
    gallerycontainer: {
        marginBottom: 8,
        alignItems: 'center',
        width: '100%',
    },
    galleryImage: {
        width: SIZES.ScreenWidth / 3.55,
        height: SIZES.ScreenWidth / 2.35,
        margin: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_20,
    },
});

export default BugReport;
