import React, { useState } from 'react';
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
import { Icon } from '@rneui/base';
import { COLORS, FONTS, SIZES } from '../../../../assets/constants';
import AkcruButtons from '../../../components/akcruButtons';
import Header from '../../../components/header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';
import TabContainer from '../../../components/TabContainer/TabContainer';
import { launchImageLibrary } from 'react-native-image-picker';
import { MediaType } from 'react-native-image-picker';
import useAuthStore from '../../../stores/auth.store';
import { sendReportToBackend, uploadImages } from '../../../lib/api/user.lib';
import ReportResultModal from '../../../components/ReportResultModal/ReportResultModal';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';

const BugReport = () => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);

    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

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
            //console.log('Response from Image Picker:', response);

            if (response && !response.didCancel && response.assets) {
                const uris = response.assets.map(asset => asset.uri);
                setSelectedImages(prevImages => [...prevImages, ...uris]);
            }
        });
    };

    const handleSubmitReport = async () => {
        let uploadedImageUrls: string[] = [];
        if (selectedImages.length > 0) {
            //console.log('Attempting to upload image:', selectedImages);
            const uploadResponses = await uploadImages(selectedImages);
            //console.log('Upload response:', uploadResponses);

            if (uploadResponses && uploadResponses.success) {
                uploadedImageUrls = uploadResponses.content;
                //console.log('Uploaded Image URL:', uploadedImageUrls);
            } else {
                //console.log('No image URL returned from upload');
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
        //console.log('Attempting to remove image:', imageUri);

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
            <View style={{flex: 1}}>
                <ScrollView style={{flex: 1}} stickyHeaderIndices={[0]}>
                    <View style={{zIndex: 20, backgroundColor: COLORS.AKCRUBACKGROUND, paddingBottom: 10}}>
                        <Header />
                        <TouchableOpacity
                            onPress={() => navigation.pop()}
                            style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{...FONTS.Title2, color: COLORS.MIDORANGE, textAlign: 'center'}}>
                                BUG REPORT
                            </Text>
                            <View style={{width: '90%'}}>
                                <Text style={styles.instructionText}>
                                    Please fill in the form below to report a bug you've encountered.
                                </Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a brief description of the bug you encountered"
                                placeholderTextColor={COLORS.DARKGREY}
                                multiline
                                maxLength={500}
                                onChangeText={setDescription}
                                value={description}
                            />
                        </View>
                        <Text style={styles.instructionText}>Add a screenshot of the bug if possible.</Text>
                        <View style={{alignItems: 'center', paddingBottom: 10}}>
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
                            <Icon name="images" type="ionicon" color={COLORS.MIDORANGE} size={30} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <View style={styles.sendReportButtonContainer}>
                    <AkcruButtons.LrgButton
                        btnname="Send Report"
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
    gallerycontainer: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    galleryImage: {
        width: SIZES.ScreenWidth / 3.55,
        height: SIZES.ScreenWidth / 2.35,
        margin: 5,
        borderRadius: 5,
    },
});

export default BugReport;
