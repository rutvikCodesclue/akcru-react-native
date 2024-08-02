import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Platform,
    StyleSheet,
    Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants/theme';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {extractUsernamesFromText, selectAvatarBorderColor} from '../../../util/util';
import AkcruLevels from '../../../components/akcruBadges';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {Image} from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {createPost, uploadPictures, uploadVideo} from '../../../lib/api/post.lib';
import CalculateVideoDuration from '../../../util/calculatevideoduration';
import Video from 'react-native-video';
import {findAUser, searchForUsers} from '../../../lib/api/user.lib';
import {IPollType, IUserProfile} from '../../../../types';
import UserTaggedCard from '../../../components/UserTaggedCard';
import {sendTagNotification} from '../../../lib/api/notify.lib';
import {Image as CompressorImage, Video as VideoCompressor} from 'react-native-compressor';
import {ProgressView} from '@react-native-community/progress-view';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import {createPoll} from '../../../lib/api/poll.lib';

const NewPoll = () => {
    const navigation = useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();
    const {user} = useAuthStore();
    const [pollText, setPollText] = useState('');
    const [cancelidVideo, setcancelidVideo] = useState('');

    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const [selectedVideo, setSelectedVideo] = useState('');

    const [showSizeErrorModal, setShowSizeErrorModal] = useState(false);

    const [isTagging, setIsTagging] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [suggestions, setSuggestions] = useState<IUserProfile[]>([]);

    const [isPosting, setIsPosting] = useState(false);
    const [isCompress, setIsCompress] = useState(false);
    const [progressVal, setProgress] = useState(0);
    const videoRef = useRef(null);

    const [pollChoices, setPollChoices] = useState<{text: string; imageUrl?: string}[]>([{text: ''}]);

    const [hours, setHours] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');

    // Function to ensure only numeric input
    const handleNumericInput = (text, setter) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setter(numericText);
    };

    const [isPollButtonEnabled, setIsPollButtonEnabled] = useState(false);

    useEffect(() => {
        const isValidDuration = parseInt(hours) > 0 || parseInt(minutes) > 0;
        const hasValidChoices = pollChoices.length >= 2 && pollChoices.every(choice => choice.text.trim().length > 0);
        const isPollValid = pollText.trim().length > 0 && isValidDuration && hasValidChoices;
        setIsPollButtonEnabled(isPollValid);
    }, [pollText, pollChoices, hours, minutes]);

    const addChoice = () => {
        if (pollChoices.length < 8) {
            setPollChoices([...pollChoices, {text: ''}]);
        } else {
            Alert.alert('Limit Reached', 'You can only add up to 8 choices.');
        }
    };

    const removeChoice = (index: number) => {
        setPollChoices(pollChoices.filter((_, i) => i !== index));
    };

    const updateChoiceText = (text: string, index: number) => {
        const newChoices = [...pollChoices];
        newChoices[index].text = text;
        setPollChoices(newChoices);
    };

    const selectChoiceImage = async (index: number) => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 1,
        };

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                const imageUri = response.assets[0].uri;
                const newChoices = [...pollChoices];
                newChoices[index].imageUrl = imageUri;
                setPollChoices(newChoices);
            }
        });
    };

    const getFileSize = async filePath => {
        try {
            const response = await fetch(filePath, {method: 'HEAD'});
            const contentLength = response._bodyBlob._data.size;
            return contentLength ? parseInt(contentLength, 10) : 0;
        } catch (error) {
            console.error('Error getting file size: ', error);
            Alert.alert('Error', 'Could not get file size.');
            return 0;
        }
    };
    const selectPollImage = async () => {
        let options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {
                path: 'images',
            },
            selectionLimit: 3,
        };

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response && !response.didCancel && response.assets) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;

                const maxSizeInBytes = 10 * 1024 * 1024;
                let imagesForPost = [];

                for (const asset of response.assets) {
                    if (asset.fileSize && asset.fileSize > maxSizeInBytes) {
                        setShowSizeErrorModal(true);
                        return;
                    } else {
                        if (asset.uri) {
                            imagesForPost.push(asset.uri);
                        }
                    }
                }

                setSelectedImages(imagesForPost);
            }
        });
    };

    const [videoDuration, setVideoDuration] = useState(0);

    const handleVideoDuration = (duration: React.SetStateAction<number>) => {
        setVideoDuration(duration);
    };

    <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />;

    const selectPollVideo = async () => {
        let options = {
            mediaType: 'video' as MediaType,
            quality: 1,
            selectionLimit: 1,
        };

        let callbackExecuted = false;

        launchImageLibrary(options, response => {
            if (response.didCancel) {
                if (callbackExecuted) {
                    return;
                }

                callbackExecuted = true;
            } else if (response.errorCode) {
            } else if (response.assets) {
                const video = response.assets[0];

                const maxSizeInBytes = 1000 * 1024 * 1024;
                if (video.fileSize > maxSizeInBytes) {
                    return;
                }

                setSelectedVideo(video.uri);

                if (pollText) {
                    setSelectedImages([]);
                }
            }
        });
    };

    const determinePostType = (): IPollType => {
        if (pollText && (selectedImages.length > 0 || selectedVideo)) {
            return 'HYBRID';
        } else if (selectedImages.length > 0) {
            return 'IMAGE';
        } else if (selectedVideo) {
            return 'VIDEO';
        } else {
            return 'TEXT';
        }
    };

    const compressAndUploadImages = async selectedImages => {
        const originalSizeList = [];
        const compressedSizeList = [];
        const compressedImages = [];

        for (let image of selectedImages) {
            // Get the original file size
            const originalSize = await getFileSize(image);
            originalSizeList.push(originalSize);

            // Compress the image
            const compressedImagePath = await CompressorImage.compress(image, {
                compressionMethod: 'auto',
            });

            // Get the compressed file size
            const compressedSize = await getFileSize(compressedImagePath);
            compressedSizeList.push(compressedSize);

            compressedImages.push(compressedImagePath);
        }
        return compressedImages;
    };

    //Updated Code adding GIF

    const onCancelVideo = async () => {
        await VideoCompressor.cancelCompression(cancelidVideo);
        setIsCompress(false);
        setcancelidVideo('');
        setProgress(0);
    };

    const OnPollPress = async () => {
        try {
            if (pollText === '' || pollChoices.length === 0) {
                return;
            }

            const pollType = determinePostType();
            let content = [];
            let imageUrl = null;
            let videoUrl = null;

            if (pollType === 'TEXT') {
                content = [pollText];
                setIsPosting(true);
            } else if (pollType === 'IMAGE') {
                setIsPosting(true);

                // Separate GIFs from other images
                const gifs = selectedImages.filter(image => image.toLowerCase().endsWith('.gif'));
                const otherImages = selectedImages.filter(image => !image.toLowerCase().endsWith('.gif'));

                let imageUrls = [];
                if (otherImages.length > 0) {
                    // Compress and upload other images
                    const compressedImages = await compressAndUploadImages(otherImages);
                    imageUrls = await uploadPictures(compressedImages);
                }

                let gifUrls = [];
                if (gifs.length > 0) {
                    // Upload GIFs directly without compression
                    gifUrls = await uploadPictures(gifs);
                }

                // Combine both URLs
                content = [...imageUrls, ...gifUrls];
                if (imageUrls.length > 0) {
                    imageUrl = imageUrls[0]; // Use the first image URL for the poll question
                } else if (gifUrls.length > 0) {
                    imageUrl = gifUrls[0]; // Use the first gif URL for the poll question
                }
            } else if (pollType === 'VIDEO') {
                setIsCompress(true);
                const compressedVideoPath = await VideoCompressor.compress(
                    selectedVideo,
                    {
                        compressionMethod: 'auto',
                        getCancellationId: cancellationId => {
                            setcancelidVideo(cancellationId);
                        },
                        progressDivider: 10,
                    },
                    progress => {
                        setProgress(progress);
                    },
                );
                setIsCompress(false);
                setIsPosting(true);
                videoUrl = await uploadVideo(compressedVideoPath, 'video', videoDuration);
                content = [videoUrl];
            } else if (pollType === 'HYBRID') {
                if (!selectedVideo) {
                    setIsPosting(true);
                }
                content = [pollText];

                // Separate GIFs from other images
                const gifs = selectedImages.filter(image => image.toLowerCase().endsWith('.gif'));
                const otherImages = selectedImages.filter(image => !image.toLowerCase().endsWith('.gif'));

                let imageUrls = [];
                if (otherImages.length > 0) {
                    // Compress and upload other images
                    const compressedImages = await compressAndUploadImages(otherImages);
                    imageUrls = await uploadPictures(compressedImages);
                }

                let gifUrls = [];
                if (gifs.length > 0) {
                    // Upload GIFs directly without compression
                    gifUrls = await uploadPictures(gifs);
                }

                if (selectedVideo) {
                    // Upload video if exists
                    setIsCompress(true);
                    const compressedVideoPath = await VideoCompressor.compress(
                        selectedVideo,
                        {
                            compressionMethod: 'auto',
                            getCancellationId: cancellationId => {
                                setcancelidVideo(cancellationId);
                            },
                            progressDivider: 10,
                        },
                        progress => {
                            setProgress(progress);
                        },
                    );
                    setIsCompress(false);
                    setIsPosting(true);

                    videoUrl = await uploadVideo(compressedVideoPath, 'video', videoDuration);
                }

                // Combine all media URLs
                const mediaUrls = [...imageUrls, ...gifUrls];
                if (videoUrl) {
                    mediaUrls.push(videoUrl);
                }

                content = content.concat(mediaUrls);
                if (imageUrls.length > 0) {
                    imageUrl = imageUrls[0]; // Use the first image URL for the poll question
                } else if (gifUrls.length > 0) {
                    imageUrl = gifUrls[0]; // Use the first gif URL for the poll question
                }
            }

            const choicesWithImageUrls = await Promise.all(
                pollChoices.map(async choice => {
                    if (choice.imageUrl) {
                        const compressedImages = await compressAndUploadImages([choice.imageUrl]);
                        const imageUrl = await uploadPictures(compressedImages);
                        return {...choice, imageUrl: imageUrl[0]};
                    }
                    return choice;
                }),
            );

            const durationHours = parseInt(hours) || 0;
            const durationMinutes = parseInt(minutes) || 0;
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + durationHours);
            expirationDate.setMinutes(expirationDate.getMinutes() + durationMinutes);

            const result = await createPoll(
                pollText,
                imageUrl || videoUrl,
                choicesWithImageUrls,
                expirationDate.toISOString(),
                pollType,
            );

            if (result && result.id) {
                const newPollId = result.id;

                const taggedUsernames = extractUsernamesFromText(pollText);

                if (taggedUsernames.includes('followers')) {
                    const notificationType = 'UserTaggedOnPoll';
                    const success = await sendTagNotification(user?.id, notificationType, newPollId, '@followers');
                    if (!success) {
                        console.error(`Failed to send notification to followers`);
                    }
                }

                await Promise.all(
                    taggedUsernames.map(async username => {
                        if (username === 'followers') return; // Skip the followers tag here
                        try {
                            const user = await findAUser({username});
                            if (user && user.id) {
                                const notificationType = 'UserTaggedOnPoll';
                                const success = await sendTagNotification(user.id, notificationType, newPollId);
                                if (success) {
                                } else {
                                    console.error(`Failed to send notification to ${username}`);
                                }
                            } else {
                                console.error(`User not found for username: ${username}`);
                            }
                        } catch (error) {
                            console.error(`Error processing tag for username: ${username}`, error);
                        }
                    }),
                );
                setIsPosting(false);
                navigation.goBack();
            } else {
                console.error('Error creating the poll');
            }
        } catch (error) {
            console.error('Error creating the poll:', error);
            setIsPosting(false);
        }
        if (!cancelidVideo) {
            setPollText('');
            setPollChoices([{text: ''}]);
            setSelectedImages([]);
            setSelectedVideo('');
        } else {
            setSelectedImages([]);
            setSelectedVideo('');
        }
    };

    useEffect(() => {
        const fetchUserSuggestions = async () => {
            if (isTagging && currentTag) {
                try {
                    const suggestions = await searchForUsers(currentTag);
                    setSuggestions(suggestions);
                } catch (error) {
                    console.error('Error fetching user suggestions:', error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchUserSuggestions();
    }, [currentTag, isTagging]);

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
                                    onPress={OnPollPress}
                                    style={{marginLeft: 'auto'}}
                                    disabled={!isPollButtonEnabled}>
                                    <View>
                                        <Text
                                            style={[
                                                styles.postButton,
                                                !isPollButtonEnabled && styles.postButtonDisabled,
                                            ]}>
                                            Poll
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                    <View style={{marginTop: '5%', marginHorizontal: 15}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{marginRight: 8}}>
                                <TouchableOpacity>
                                    <HexAvatar
                                        source={
                                            user?.profilePicture
                                                ? {uri: user.profilePicture}
                                                : imageindex.Akcruplaceholder
                                        }
                                        size={45}
                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text style={{...FONTS.Username}}>{user ? user?.username : 'Guest'}</Text>
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
                                placeholder={'Enter the question of your poll here'}
                                placeholderTextColor={COLORS.DARKGREY}
                                style={styles.textinput}
                                secureTextEntry={false}
                                onChangeText={text => {
                                    const parts = text.split(' ');
                                    const lastPart = parts[parts.length - 1];
                                    if (lastPart.startsWith('@')) {
                                        setIsTagging(true);
                                        setCurrentTag(lastPart.slice(1));
                                    } else {
                                        setIsTagging(false);
                                        setCurrentTag('');
                                    }

                                    if (text.length <= 200) {
                                        setPollText(text);
                                    }
                                }}
                                value={pollText}
                                multiline={true}
                                maxLength={200}
                                editable={true}
                            />
                        </View>
                        {isTagging && suggestions.length > 0 && (
                            <FlatList
                                data={suggestions}
                                horizontal={false}
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={true}
                                contentContainerStyle={{flexGrow: 1}}
                                keyExtractor={item => item.id}
                                renderItem={({item, index}) => (
                                    <Pressable
                                        style={{marginVertical: 5}}
                                        onPress={() => {
                                            const newText =
                                                pollText.substring(0, pollText.lastIndexOf('@')) + `@${item.username} `;
                                            setPollText(newText);
                                            setIsTagging(false);
                                            setCurrentTag('');
                                        }}>
                                        <UserTaggedCard
                                            userPicture={item.profilePicture}
                                            userName={item.username}
                                            onPress={() => {
                                                const newText =
                                                    pollText.substring(0, pollText.lastIndexOf('@')) +
                                                    `@${item.username} `;
                                                setPollText(newText);
                                                setIsTagging(false);
                                                setCurrentTag('');
                                            }}
                                            userID={item.id}
                                            akcruBadge={item.badge}
                                            firstName={item.firstName}
                                            blackCloakStatus={item.blackCloakStatus}
                                            ownerStatus={item.ownerStatus}
                                            companyStatus={item.companyStatus}
                                            influencer={item.influencerStatus}
                                        />
                                    </Pressable>
                                )}
                            />
                        )}
                        {!isTagging && (
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity style={{marginHorizontal: 10}} onPress={selectPollImage}>
                                    <Icon name="images" type="ionicon" color={COLORS.AKCRUBLUE} size={20} />
                                </TouchableOpacity>

                                {/* <TouchableOpacity style={{marginHorizontal: 8}} onPress={selectPollVideo}>
                                    <Icon
                                        name="video-account"
                                        type="material-community"
                                        color={COLORS.AKCRUBLUE}
                                        size={30}
                                    />
                                </TouchableOpacity> */}
                            </View>
                        )}
                        {selectedVideo && (
                            <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />
                        )}
                        {!isTagging && (
                            <View style={{marginTop: 10}}>
                                <FlatList
                                    data={selectedImages}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({item}) => (
                                        <View>
                                            <Image
                                                source={{uri: item}}
                                                style={{
                                                    width: SIZES.ScreenWidth / 3.55,
                                                    height: SIZES.ScreenWidth / 2.35,
                                                    margin: 5,
                                                    borderRadius: 5,
                                                }}
                                            />
                                        </View>
                                    )}
                                />
                                {selectedVideo && (
                                    <View style={styles.postvideo}>
                                        <Video
                                            ref={videoRef}
                                            style={{width: '100%', height: '100%', borderRadius: 10}}
                                            source={{uri: selectedVideo}}
                                            resizeMode="cover"
                                            repeat={true}
                                            muted={true}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                        <View>
                            <Text style={{...FONTS.paragraph1, textAlign: 'center', color: COLORS.DARKGREY}}>
                                (Must have at least 2 choices and at most 8 choices.)
                            </Text>
                        </View>
                        <View style={styles.choicesContainer}>
                            {pollChoices.map((choice, index) => (
                                <View key={index} style={styles.choice}>
                                    <TextInput
                                        placeholder={`Choice ${index + 1}`}
                                        placeholderTextColor={COLORS.DARKGREY}
                                        style={styles.choiceInput}
                                        secureTextEntry={false}
                                        onChangeText={text => updateChoiceText(text, index)}
                                        value={choice.text}
                                    />
                                    {choice.imageUrl && (
                                        <Image source={{uri: choice.imageUrl}} style={styles.choiceImage} />
                                    )}
                                    <View style={styles.choiceButtons}>
                                        <TouchableOpacity onPress={() => selectChoiceImage(index)}>
                                            <Icon name="images" type="ionicon" color={COLORS.AKCRUBLUE} size={20} />
                                        </TouchableOpacity>
                                        {pollChoices.length > 2 && (
                                            <TouchableOpacity onPress={() => removeChoice(index)}>
                                                <Icon
                                                    name="remove-circle"
                                                    type="ionicon"
                                                    color={COLORS.CATREDDRK}
                                                    size={20}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity onPress={addChoice} style={styles.addChoiceButton}>
                            <Text style={styles.addChoiceButtonText}>Add Choice</Text>
                            <Icon name="plus-circle" type="material-community" color={COLORS.AKCRUPINK} size={25} />
                        </TouchableOpacity>
                        <View style={styles.durationContainer}>
                            <View style={{marginBottom: 10}}>
                                <Text style={{...FONTS.paragraph1, textAlign: 'center', color: COLORS.DARKGREY}}>
                                    (Must enter the amount of time the poll will run.)
                                </Text>
                            </View>
                            <View style={{marginBottom: 10}}>
                                <Text style={styles.durationLabel}>Poll Duration</Text>
                            </View>

                            <View>
                                <Icon name="timer" type="material-community" color={COLORS.PINK} size={25} />
                            </View>

                            <View style={styles.durationInputs}>
                                <TextInput
                                    style={styles.durationInput}
                                    placeholder="Hours"
                                    keyboardType="numeric"
                                    value={hours}
                                    onChangeText={text => handleNumericInput(text, setHours)}
                                    placeholderTextColor={COLORS.DARKGREY}
                                />
                                <Text style={styles.durationSeparator}>:</Text>
                                <TextInput
                                    style={styles.durationInput}
                                    placeholder="Minutes"
                                    keyboardType="numeric"
                                    value={minutes}
                                    onChangeText={text => handleNumericInput(text, setMinutes)}
                                    placeholderTextColor={COLORS.DARKGREY}
                                />
                            </View>
                        </View>
                        <Modal animationType="fade" transparent={true} visible={showSizeErrorModal}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <View
                                    style={{
                                        backgroundColor: COLORS.AKCRUBACKGROUND,
                                        padding: 20,
                                        borderRadius: 10,
                                        alignItems: 'center',
                                        marginHorizontal: 15,
                                    }}>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            marginBottom: 10,
                                            textAlign: 'center',
                                        }}>
                                        {'Image is too large. Please select an image under 5MB.'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowSizeErrorModal(false);
                                        }}>
                                        <Text
                                            style={{
                                                ...FONTS.Title2,
                                                marginBottom: 10,
                                                textAlign: 'center',
                                                color: COLORS.MIDORANGE,
                                            }}>
                                            {'Close'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
                <Modal visible={isCompress} transparent={true} animationType="fade">
                    <View style={stylesProgress.modalBackground}>
                        <View style={stylesProgress.modalContainer}>
                            <Text style={stylesProgress.progressText}>{`Loading: ${Math.round(
                                progressVal * 100,
                            )}%`}</Text>
                            {Platform.OS === 'android' ? (
                                <ProgressBar
                                    styleAttr="Horizontal"
                                    indeterminate={false}
                                    progress={progressVal}
                                    color={COLORS.PINK}
                                    style={stylesProgress.progressBar}
                                />
                            ) : (
                                <ProgressView
                                    progress={progressVal}
                                    progressTintColor={COLORS.PINK}
                                    style={stylesProgress.progressBar}
                                />
                            )}
                            <TouchableOpacity onPress={onCancelVideo}>
                                <View>
                                    <Text style={styles.cancelButton}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal transparent={true} visible={isPosting} animationType="fade">
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.PINK} />
                        {/* We are posting text in middle white */}
                        <Text style={stylesProgress.loadingText}>We're Posting...</Text>
                    </View>
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
};

export default NewPoll;

const stylesProgress = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: COLORS.AKCRUBACKGROUND,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        marginBottom: 10,
        ...FONTS.Title2,
    },
    progressBar: {
        width: '100%',
        height: 20,
    },
    loadingText: {
        ...FONTS.Title2,
        color: COLORS.WHITE,
        marginTop: 10,
    },
});
