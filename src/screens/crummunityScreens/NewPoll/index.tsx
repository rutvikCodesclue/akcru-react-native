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
import {COLORS, FONTS, isTablet, SIZES} from '../../../../assets/constants/theme';
import {Icon} from '@rneui/base';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {extractUsernamesFromText, selectAvatarBorderColor} from '../../../util/util';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import {MediaType, launchImageLibrary} from 'react-native-image-picker';
import {Image} from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {uploadPictures, uploadVideo} from '../../../lib/api/post.lib';
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
import AkcruButtons from '../../../components/akcruButtons';
import ProfileUserBadges from '../../../components/ProfileUserBadges';
import ArchetypeHorizontalDivider from '../../../components/ArchetypeHorizontalDivider';

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
    const [isPressing, setIsPressing] = useState(false);

    const videoRef = useRef(null);

    const [pollChoices, setPollChoices] = useState<{text: string; imageUrl?: string}[]>([{text: ''}]);
    const [hours, setHours] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');

    const handleNumericInput = (text, setter) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setter(numericText);
    };

    const [isPollButtonEnabled, setIsPollButtonEnabled] = useState(false);

    useEffect(() => {
        const isValidDuration = parseInt(hours, 10) > 0 || parseInt(minutes, 10) > 0;
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
        const options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {path: 'images'},
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

    const removeSelectedImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const removeSelectedVideo = () => {
        setSelectedVideo('');
        setVideoDuration(0);
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
        const options = {
            mediaType: 'photo' as MediaType,
            storageOptions: {path: 'images'},
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
                const imagesForPost: string[] = [];

                for (const asset of response.assets) {
                    if (asset.fileSize && asset.fileSize > maxSizeInBytes) {
                        setShowSizeErrorModal(true);
                        return;
                    }
                    if (asset.uri) {
                        imagesForPost.push(asset.uri);
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

    const determinePostType = (): IPollType => {
        if (pollText && (selectedImages.length > 0 || selectedVideo)) {
            return 'HYBRID';
        }
        if (selectedImages.length > 0) {
            return 'IMAGE';
        }
        if (selectedVideo) {
            return 'VIDEO';
        }
        return 'TEXT';
    };

    const compressAndUploadImages = async images => {
        const compressedImages = [];

        for (const image of images) {
            await getFileSize(image);
            const compressedImagePath = await CompressorImage.compress(image, {compressionMethod: 'auto'});
            await getFileSize(compressedImagePath);
            compressedImages.push(compressedImagePath);
        }

        return compressedImages;
    };

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

                const gifs = selectedImages.filter(image => image.toLowerCase().endsWith('.gif'));
                const otherImages = selectedImages.filter(image => !image.toLowerCase().endsWith('.gif'));

                let imageUrls = [];
                if (otherImages.length > 0) {
                    const compressedImages = await compressAndUploadImages(otherImages);
                    imageUrls = await uploadPictures(compressedImages);
                }

                let gifUrls = [];
                if (gifs.length > 0) {
                    gifUrls = await uploadPictures(gifs);
                }

                content = [...imageUrls, ...gifUrls];
                if (imageUrls.length > 0) {
                    imageUrl = imageUrls[0];
                } else if (gifUrls.length > 0) {
                    imageUrl = gifUrls[0];
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

                const gifs = selectedImages.filter(image => image.toLowerCase().endsWith('.gif'));
                const otherImages = selectedImages.filter(image => !image.toLowerCase().endsWith('.gif'));

                let imageUrls = [];
                if (otherImages.length > 0) {
                    const compressedImages = await compressAndUploadImages(otherImages);
                    imageUrls = await uploadPictures(compressedImages);
                }

                let gifUrls = [];
                if (gifs.length > 0) {
                    gifUrls = await uploadPictures(gifs);
                }

                if (selectedVideo) {
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

                const mediaUrls = [...imageUrls, ...gifUrls];
                if (videoUrl) {
                    mediaUrls.push(videoUrl);
                }

                content = content.concat(mediaUrls);
                if (imageUrls.length > 0) {
                    imageUrl = imageUrls[0];
                } else if (gifUrls.length > 0) {
                    imageUrl = gifUrls[0];
                }
            }

            const choicesWithImageUrls = await Promise.all(
                pollChoices.map(async choice => {
                    if (choice.imageUrl) {
                        const compressedImages = await compressAndUploadImages([choice.imageUrl]);
                        const uploadedImageUrl = await uploadPictures(compressedImages);
                        return {...choice, imageUrl: uploadedImageUrl[0]};
                    }
                    return choice;
                }),
            );

            const durationHours = parseInt(hours, 10) || 0;
            const durationMinutes = parseInt(minutes, 10) || 0;
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
                        console.error('Failed to send notification to followers');
                    }
                }

                await Promise.all(
                    taggedUsernames.map(async username => {
                        if (username === 'followers') return;
                        try {
                            const taggedUser = await findAUser({username});
                            if (taggedUser && taggedUser.id) {
                                const notificationType = 'UserTaggedOnPoll';
                                const success = await sendTagNotification(taggedUser.id, notificationType, newPollId);
                                if (!success) {
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
            setHours('');
            setMinutes('');
        } else {
            setSelectedImages([]);
            setSelectedVideo('');
            setHours('');
            setMinutes('');
        }
    };

    const handlePress = () => {
        if (!isPressing) {
            setIsPressing(true);
            navigation.pop();
            setTimeout(() => setIsPressing(false), 1000);
        }
    };

    useEffect(() => {
        const fetchUserSuggestions = async () => {
            if (isTagging && currentTag) {
                try {
                    const fetchedSuggestions = await searchForUsers(currentTag);
                    setSuggestions(fetchedSuggestions);
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

    const profileHandleRaw = (user?.username ?? 'Guest').trim() || 'Guest';
    const profileHandleDisplay = profileHandleRaw;

    return (
        <TabContainer>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.headerZIndex}>
                        <Header />
                    </View>
                    <View style={styles.cancelRowStandalone}>
                        <TouchableOpacity onPress={handlePress} disabled={isPressing}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.composerWrap}>
                        <View style={styles.authorRow}>
                            <View style={styles.avatarWrap}>
                                <TouchableOpacity>
                                    <HexAvatar
                                        source={
                                            user?.profilePicture ? {uri: user.profilePicture} : imageindex.Akcruplaceholder
                                        }
                                        size={isTablet() ? 82 : 58}
                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                        rotateFrameDegrees={90}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.authorMeta}>
                                <View style={styles.usernameBadgeRow}>
                                    <Text style={styles.usernameText} numberOfLines={1} ellipsizeMode="tail">
                                        {profileHandleDisplay}
                                    </Text>
                                    <ProfileUserBadges user={user} variant="inline" style={styles.inlineBadge} />
                                </View>
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
                                renderItem={({item}) => (
                                    <Pressable
                                        style={styles.suggestionItem}
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
                            <>
                                <View style={styles.uploadMediaRow}>
                                    <Text style={styles.commentSwitchLabel}>Want to upload media?</Text>
                                    <TouchableOpacity style={styles.uploadMediaButton} onPress={selectPollImage}>
                                        <Icon name="plus" type="material-community" color={COLORS.WHITE} size={22} />
                                    </TouchableOpacity>
                                </View>
                                {(selectedImages.length > 0 || !!selectedVideo) && (
                                    <ArchetypeHorizontalDivider title="Media" containerStyle={styles.uploadDivider} />
                                )}
                            </>
                        )}

                        {selectedVideo && <CalculateVideoDuration videoUri={selectedVideo} onDuration={handleVideoDuration} />}

                        {!isTagging && (
                            <View style={styles.mediaPreviewWrap}>
                                <FlatList
                                    data={selectedImages}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({item, index}) => (
                                        <View style={styles.previewImageCard}>
                                            <Image
                                                source={{uri: item}}
                                                style={[
                                                    styles.previewImage,
                                                    {
                                                        height: isTablet()
                                                            ? SIZES.ScreenWidth / 2.9
                                                            : SIZES.ScreenWidth / 1.9,
                                                    },
                                                ]}
                                            />
                                            <TouchableOpacity
                                                style={styles.removeMediaButton}
                                                onPress={() => removeSelectedImage(index)}>
                                                <Icon
                                                    name="close"
                                                    type="material-community"
                                                    color={COLORS.WHITE}
                                                    size={16}
                                                />
                                            </TouchableOpacity>
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
                                        <TouchableOpacity style={styles.removeVideoButton} onPress={removeSelectedVideo}>
                                            <Icon
                                                name="close"
                                                type="material-community"
                                                color={COLORS.WHITE}
                                                size={16}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.limitCard}>
                            <Text style={styles.limitText}>* Note: Image limit: 10 MB each</Text>
                        </View>

                        <ArchetypeHorizontalDivider title="Choices" containerStyle={styles.uploadDivider} />

                        <View style={styles.choicesContainer}>
                            {pollChoices.map((choice, index) => (
                                <View key={index} style={styles.choice}>
                                    <View style={styles.choiceInputRow}>
                                        <TextInput
                                            placeholder={`Choice ${index + 1}`}
                                            placeholderTextColor={COLORS.DARKGREY}
                                            style={styles.choiceInput}
                                            secureTextEntry={false}
                                            onChangeText={text => updateChoiceText(text, index)}
                                            value={choice.text}
                                        />
                                        <View style={styles.choiceButtons}>
                                            <TouchableOpacity onPress={() => selectChoiceImage(index)}>
                                                <Icon
                                                    name="images"
                                                    type="ionicon"
                                                    color={COLORS.AKCRUBLUE}
                                                    size={isTablet() ? 30 : 20}
                                                />
                                            </TouchableOpacity>
                                            {pollChoices.length > 2 && (
                                                <TouchableOpacity onPress={() => removeChoice(index)}>
                                                    <Icon
                                                        name="remove-circle"
                                                        type="ionicon"
                                                        color={COLORS.CATREDDRK}
                                                        size={isTablet() ? 30 : 20}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                    {choice.imageUrl && <Image source={{uri: choice.imageUrl}} style={styles.choiceImage} />}
                                </View>
                            ))}
                            <TouchableOpacity onPress={addChoice} style={styles.addChoiceButton}>
                                <Text style={styles.addChoiceButtonText}>Add Choice</Text>
                                <Icon
                                    name="plus-circle"
                                    type="material-community"
                                    color={COLORS.AKCRUPINK}
                                    size={isTablet() ? 30 : 25}
                                />
                            </TouchableOpacity>
                            <Text style={styles.durationHint}>* Note: Must have at least 2 choices and at most 8 choices.</Text>
                        </View>

                        <ArchetypeHorizontalDivider title="Poll Duration" containerStyle={styles.uploadDivider} />

                        <View style={styles.durationContainer}>
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
                            <Text style={styles.durationHint}>* Note: Must enter the amount of time the poll will run.</Text>
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
                                    <Text style={{...FONTS.Title3, marginBottom: 10, textAlign: 'center'}}>
                                        {'Image is too large. Please select an image under 5MB.'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowSizeErrorModal(false)}>
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

                <View style={styles.bottomPostBar}>
                    <View style={styles.bottomPostButton}>
                        <AkcruButtons.LrgButton
                            btnname="Poll"
                            onPress={OnPollPress}
                            color={COLORS.AKCRUBLUE}
                            variant="auth"
                            authButtonWidth={SIZES.ScreenWidth - 32}
                            disabled={!isPollButtonEnabled}
                        />
                    </View>
                </View>

                <Modal visible={isCompress} transparent={true} animationType="fade">
                    <View style={stylesProgress.modalBackground}>
                        <View style={stylesProgress.modalContainer}>
                            <Text style={stylesProgress.progressText}>{`Loading: ${Math.round(progressVal * 100)}%`}</Text>
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
