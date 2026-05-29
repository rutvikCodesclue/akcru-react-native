import React, {useEffect, useState} from 'react';
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
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NoBottomTabStackParams} from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import {launchImageLibrary} from 'react-native-image-picker';
import {MediaType} from 'react-native-image-picker';
import useAuthStore from '../../../stores/auth.store';
import {findAUser, sendAbuseReportToBackend, uploadImages} from '../../../lib/api/user.lib';
import ReportResultModal from '../../../components/ReportResultModal/ReportResultModal';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';
import BackButton from '../../../components/General/backbutton';
import LinearGradient from 'react-native-linear-gradient';
import ProfileUserBadges from '../../../components/ProfileUserBadges';

const ReportUser = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);

    const userID: string | undefined = route.params?.userID;
    const [reportedUser, setReportedUser] = useState();

    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

    const [showImageCountErrorModal, setShowImageCountErrorModal] = useState(false);

    const {authorId, authorUsername} = route.params;

    useEffect(() => {
        if (userID) {
            const fetchUserDetails = async () => {
                const userDetails = await findAUser({id: userID});
                setReportedUser(userDetails);
            };

            fetchUserDetails();
        }
    }, [userID]);
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
            }
        }

        const reportData = {
            description: description,
            email: user?.email,
            imageURL: uploadedImageUrls,

            type: 'REPORT',
            reportedByUserId: user?.id,
            userId: userID || authorId,
        };

        try {
            const {success, message} = await sendAbuseReportToBackend(reportData);
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
        navigation.pop();

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
    const reportTargetName = reportedUser?.username ? reportedUser.username : authorUsername;
    const canSubmit = description.trim().length >= 3;

    return (
        <TabContainer>
            <View style={styles.safeArea}>
                <ScrollView style={{flex: 1}} stickyHeaderIndices={[0]} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerWrap}>
                        <Header />
                        <BackButton navigation={navigation} />
                    </View>
                    <View style={styles.screenContent}>
                        <LinearGradient
                            colors={['rgba(124,58,237,0.18)', 'rgba(236,72,153,0.08)']}
                            style={styles.reportCard}>
                            <Text style={styles.title}>REPORT A USER</Text>
                            <Text style={styles.instructionText}>
                                We take abuse seriously at Akcru. Please share details of what happened with "
                                {reportTargetName}".
                            </Text>
                            {reportedUser ? <ProfileUserBadges user={reportedUser} variant="inline" style={styles.inlineBadge} /> : null}
                            <TextInput
                                style={styles.input}
                                placeholder="Add a detailed description of the abuse encountered"
                                placeholderTextColor={COLORS.DARKGREY}
                                multiline
                                maxLength={500}
                                onChangeText={setDescription}
                                value={description}
                            />
                            <Text style={styles.charCount}>{description.length}/500</Text>
                        </LinearGradient>
                        <Text style={styles.mediaTitle}>Add screenshots</Text>
                        <View style={styles.galleryWrap}>
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
                            <Text style={styles.imagePickerLabel}>Choose Images</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <View style={styles.sendReportButtonContainer}>
                    <AkcruButtons.LrgButton
                        btnname="Send Report"
                        onPress={() => handleSubmitReport()}
                        color={canSubmit ? COLORS.PURPLE : COLORS.DARKERGREY}
                        disabled={!canSubmit}
                        variant="auth"
                        authButtonWidth={SIZES.ScreenWidth - 32}
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
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.BLACK,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    headerWrap: {
        zIndex: 20,
        backgroundColor: COLORS.BLACK,
        paddingBottom: 10,
    },
    screenContent: {
        paddingHorizontal: 15,
        paddingTop: 6,
    },
    reportCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.OVERLAY_WHITE_08,
        padding: 12,
    },
    title: {
        ...FONTS.Title2,
        color: COLORS.PINK,
        textAlign: 'center',
        marginBottom: 6,
    },
    instructionText: {
        ...FONTS.paragraph1,
        color: COLORS.LIGHTGREY,
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
        paddingBottom: 8,
    },
    inlineBadge: {
        alignSelf: 'center',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.DARKGREY,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        minHeight: 130,
        textAlignVertical: 'top',
        color: COLORS.LIGHTGREY,
        width: '100%',
        backgroundColor: COLORS.OVERLAY_WHITE_02,
    },
    charCount: {
        ...FONTS.paragraph3,
        color: COLORS.OVERLAY_WHITE_45,
        alignSelf: 'flex-end',
        marginTop: 6,
    },
    mediaTitle: {
        ...FONTS.Title3,
        color: COLORS.WHITE,
        marginTop: 12,
        marginBottom: 8,
    },
    galleryWrap: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    imagePickerButton: {
        alignSelf: 'center',
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.AKCRUBLUE,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(23,37,84,0.35)',
    },
    imagePickerLabel: {
        ...FONTS.Title3,
        color: COLORS.AKCRUBLUE,
        marginLeft: 6,
    },
    sendReportButtonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.FADEDBLACK,
        backgroundColor: COLORS.BLACK,
        width: '100%',
    },
    gallerycontainer: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    galleryImage: {
        width: SIZES.ScreenWidth / 3.8,
        height: SIZES.ScreenWidth / 2.5,
        margin: 5,
        borderRadius: 8,
    },
});

export default ReportUser;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}
