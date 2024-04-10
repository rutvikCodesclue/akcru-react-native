import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, FlatList, Image, Modal, Alert, Pressable} from 'react-native';
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
import { findAUser, sendAbuseReportToBackend, sendReportToBackend, uploadImages } from '../../../lib/api/user.lib';
import ReportResultModal from '../../../components/ReportResultModal/ReportResultModal';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import EnlargeGalleryModal from '../../../components/EnlargeGalleryModal/EnlargeGalleryModal';

const ReportUser = ({route}) => {
    const navigation = useNavigation<NativeStackNavigationProp<NoBottomTabStackParams>>();
    const user = useAuthStore(state => state.user);

    const userID: string | undefined = route.params?.userID;
    const [reportedUser, setReportedUser] = useState(); // State to store the reported user's details

    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

    const [showImageCountErrorModal, setShowImageCountErrorModal] = useState(false);

     const {
         authorId,
         authorUsername,
         authorFirstName,
         authorProfilePicture,
         authorBadge,
         // Any other author details passed
     } = route.params;

    // Fetch reported user's details
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
            selectionLimit: 3, // 0 for no limit or set to a specific number greater than 1
        };

        launchImageLibrary(options, response => {
            //console.log('Response from Image Picker:', response);

            if (response && !response.didCancel && response.assets) {
                // Map through the assets to extract URIs
                const uris = response.assets.map(asset => asset.uri);
                setSelectedImages(prevImages => [...prevImages, ...uris]); // Append new images to the existing array
            }
        });
    };


    const handleSubmitReport = async () => {
        let uploadedImageUrls: string[] = [];
        if (selectedImages.length > 0) {
            // Attempt to upload the selected image and log the attempt
            //console.log('Attempting to upload image:', selectedImages);
            const uploadResponses = await uploadImages(selectedImages);
            //console.log('Upload response:', uploadResponses);

            // Check if the upload was successful and a URL was returned
            if (uploadResponses && uploadResponses.success) {
                // Assuming uploadResponses is an array of URLs
                uploadedImageUrls = uploadResponses.content;
                //console.log('Uploaded Image URLs:', uploadedImageUrls);
            } else {
                //console.log('No image URL returned from upload');
            }
        }
        // Proceed to use `uploadedImageUrl` as before...
        const reportData = {
            description: description,
            email: user?.email,
            imageURL: uploadedImageUrls, // Now sending an array of image URLs
            // ...(uploadedImageUrl && {imageURL: uploadedImageUrl}), // Add imageURL only if it's defined
            type: 'REPORT',
            reportedByUserId: user?.id,
            userId: userID || authorId,
        };
        //console.log('Submitting report data:', reportData);
        try {
            const {success, message} = await sendAbuseReportToBackend(reportData);
            if (success) {
                setModalType('success');
                // Alert.alert('Success', 'Report submitted successfully.');
            } else {
                setModalType('failure');
                // Alert.alert('Failed', `Failed to submit report: ${message}`);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Error', 'An error occurred while submitting the report.');
        } finally {
            setModalVisible(true); // Show the modal after submission attempt
        }
    };

    const closeModal = () => {
        // navigation.navigate('ViewUserScreen'); // Adjust the screen name as necessary
        navigation.pop();

        // Reset fields
        setDescription('');
        setSelectedImages([]);
        setModalVisible(false);
    };

    const removeFromUpload = async imageUri => {
        //console.log('Attempting to remove image:', imageUri);
        // Logic to remove image from your selectedImages state
        const updatedImages = selectedImages.filter(img => img !== imageUri);
        setSelectedImages(updatedImages);
        // Any additional logic you might need after deletion
    };

    const [selectedImage, setSelectedImage] = useState(null); // State for the selected image

    // Function to handle image press
    const handleImageEnlarge = imageUri => {
        setSelectedImage(imageUri); // Set the selected image
        setEnlargeModalVisible(true); // Open the modal
    };

    const [enlargeModalVisible, setEnlargeModalVisible] = useState(false); // State to control modal visibility

    // Function to toggle the modal's visibility
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
                            <Text style={{...FONTS.Title2, color: COLORS.PINK, textAlign: 'center'}}>
                                REPORT A USER
                            </Text>
                            <View style={{width: '90%'}}>
                                <Text style={styles.instructionText}>
                                    We take abuse serious here at Akcru. Please fill in the form below and give detailed
                                    account of the abusive events you've encountered from user "
                                    {reportedUser?.username ? reportedUser.username : authorUsername}
                                    ".
                                </Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a detailed description of the abuse encountered"
                                placeholderTextColor={COLORS.DARKGREY}
                                multiline
                                maxLength={500}
                                onChangeText={setDescription}
                                value={description}
                            />
                        </View>
                        <Text style={styles.instructionText}>Add a screenshot of the abuse you've encountered.</Text>
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
                            <Icon name="images" type="ionicon" color={COLORS.PINK} size={30} />
                        </TouchableOpacity>
                        {/* Render selected images if any */}
                    </View>
                </ScrollView>
                <View style={styles.sendReportButtonContainer}>
                    <AkcruButtons.LrgButton
                        btnname="Send Report"
                        onPress={() => handleSubmitReport()}
                        color={description.length >= 3 ? COLORS.PURPLE : COLORS.DARKERGREY} // Change color based on description length
                        disabled={description.length < 3} // Disable button if description is less than 3 characters
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
        width: '90%',
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

export default ReportUser;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

