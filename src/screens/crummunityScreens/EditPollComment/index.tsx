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
    StyleSheet,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';
import Header from '../../../components/header';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, FONTS, SIZES, isTablet} from '../../../../assets/constants/theme';
import {RouteProp} from '@react-navigation/native';
import {CrummunityStackParams} from '../../../navigation/CrummunityStack';
import {extractUsernamesFromText, selectAvatarBorderColor} from '../../../util/util';
import useAuthStore from '../../../stores/auth.store';
import imageindex from '../../../../assets/images/imageindex';
import {Image} from 'react-native';
import TabContainer from '../../../components/TabContainer/TabContainer';
import HexAvatar from '../../../components/HexAvatar';
import {editPollComment} from '../../../lib/api/poll.lib';
import {StackNavigationProp} from '@react-navigation/stack';
import Video from 'react-native-video';
import {IUserProfile} from '../../../../types';
import {findAUser, searchForUsers} from '../../../lib/api/user.lib';
import {sendTagNotification} from '../../../lib/api/notify.lib';
import ProfileUserBadges from '../../../components/ProfileUserBadges';
import AkcruButtons from '../../../components/akcruButtons';
import DisplayBadge from '../../../components/General/akcrubadge';

type EditCommentNavigationProp = StackNavigationProp<CrummunityStackParams, 'EditPollCommentScreen'>;
type EditCommentRouteProp = RouteProp<CrummunityStackParams, 'EditPollCommentScreen'>;

type Props = {
    navigation: EditCommentNavigationProp;
    route: EditCommentRouteProp;
};

const EditPollCommentScreen = ({navigation, route}: Props) => {
    const {comment} = route.params;

    const {user} = useAuthStore();
    const [commentText, setCommentText] = useState(
        comment.edited ? comment.editedText : comment.content.filter(item => !item.includes('http')).join(' '),
    );
    const [initialImages] = useState(comment.content.filter(url => url.endsWith('.jpg') || url.endsWith('.png')));
    const [initialVideo] = useState(comment.content.find(url => url.endsWith('.mp4')) || '');
    const [isTagging, setIsTagging] = useState(false);
    const [currentTag, setCurrentTag] = useState('');
    const [suggestions, setSuggestions] = useState<IUserProfile[]>([]);
    const [isCommenting, setIsCommenting] = useState(false);
    const videoRef = useRef(null);

    const onCommentPress = async () => {
        try {
            if (commentText == '') {
                return;
            }
            setIsCommenting(true);

            const result = await editPollComment(comment.id, commentText);
            if (result && result.id) {
                const newCommentId = result.id;

                const taggedUsernames = extractUsernamesFromText(commentText);

                await Promise.all(
                    taggedUsernames.map(async username => {
                        try {
                            const user = await findAUser({username});
                            if (user && user.id) {
                                const notificationType = 'UserTaggedOnPost';
                                const success = await sendTagNotification(user.id, notificationType, newCommentId);
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
                setIsCommenting(false);
                navigation.goBack();
            } else {
                setIsCommenting(false);
            }
        } catch (error) {
            console.error('Error editing the comment:', error);
            setIsCommenting(false);
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
    const canSave = commentText.trim().length > 0;

    return (
        <TabContainer>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    stickyHeaderIndices={[0]}
                    contentContainerStyle={styles.scrollContent}
                    scrollEnabled={!isTagging}>
                    <View style={styles.headerZIndex}>
                        <Header />
                    </View>
                    <View style={styles.topActionArea}>
                        <LinearGradient
                            colors={['#0a1628', '#0d0d18', '#050508']}
                            style={styles.topActionGradient}>
                            <View style={styles.topActionRow}>
                                <TouchableOpacity onPress={() => navigation.pop()}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                    <View style={styles.composerWrap}>
                        <View style={styles.authorRow}>
                            <View style={styles.avatarWrap}>
                                <TouchableOpacity>
                                    <HexAvatar
                                        source={
                                            user?.profilePicture
                                                ? {uri: user.profilePicture}
                                                : imageindex.Akcruplaceholder
                                        }
                                        size={isTablet() ? 62 : 46}
                                        bordercolor={selectAvatarBorderColor(user?.badge ?? 'AKCRUIT')}
                                        rotateFrameDegrees={90}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.authorMeta}>
                                <Text style={styles.usernameText}>{user ? user?.username : 'Guest'}</Text>
                                <ProfileUserBadges user={user} variant="inline" style={styles.inlineBadge} />
                            </View>
                        </View>
                        <View style={styles.inputAreaWrap}>
                            <View style={styles.input}>
                                <TextInput
                                    placeholder={'Tell us the "skinny" in 200 characters or less'}
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
                                            setCommentText(text);
                                        }
                                    }}
                                    value={commentText}
                                    multiline={true}
                                    maxLength={200}
                                    editable={true}
                                />
                            </View>
                            {isTagging && suggestions.length > 0 && (
                                <View style={styles.suggestionPanel}>
                                    <FlatList
                                        data={suggestions}
                                        horizontal={false}
                                        showsVerticalScrollIndicator={true}
                                        showsHorizontalScrollIndicator={false}
                                        scrollEnabled={true}
                                        nestedScrollEnabled={true}
                                        keyExtractor={item => item.id}
                                        style={styles.suggestionList}
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({item}) => (
                                            <Pressable
                                                style={styles.mentionRow}
                                                onPress={() => {
                                                    const newText =
                                                        commentText.substring(0, commentText.lastIndexOf('@')) +
                                                        `@${item.username} `;
                                                    setCommentText(newText);
                                                    setIsTagging(false);
                                                    setCurrentTag('');
                                                }}>
                                                <HexAvatar
                                                    source={
                                                        item.profilePicture
                                                            ? {uri: item.profilePicture}
                                                            : imageindex.Akcruplaceholder
                                                    }
                                                    size={38}
                                                    bordercolor={selectAvatarBorderColor(item.badge ?? 'AKCRUIT')}
                                                    rotateFrameDegrees={90}
                                                />
                                                <View style={styles.mentionMeta}>
                                                    <View style={styles.mentionNameRow}>
                                                        <Text style={styles.mentionUsername}>@{item.username}</Text>
                                                        {!!item.firstName && (
                                                            <Text style={styles.mentionFirstName}>{item.firstName}</Text>
                                                        )}
                                                    </View>
                                                    <View style={styles.mentionBadgeWrap}>
                                                        <DisplayBadge akcruBadge={item.badge} />
                                                    </View>
                                                </View>
                                            </Pressable>
                                        )}
                                    />
                                </View>
                            )}
                        </View>
                        <Text style={styles.charCount}>{commentText.length}/200</Text>

                        {!isTagging && (
                            <View style={styles.mediaPreviewWrap}>
                                <FlatList
                                    data={initialImages}
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({item}) => (
                                        <View style={styles.previewImageCard}>
                                            <Image source={{uri: item}} style={styles.previewImage} />
                                        </View>
                                    )}
                                />
                                {initialVideo && (
                                    <View style={styles.postvideo}>
                                        <Video
                                            ref={videoRef}
                                            style={{width: '100%', height: '100%', borderRadius: 10}}
                                            source={{uri: initialVideo}}
                                            resizeMode="cover"
                                            repeat={true}
                                            muted={true}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
                <View style={styles.bottomActionBar}>
                    <AkcruButtons.LrgButton
                        btnname="Save Changes"
                        onPress={onCommentPress}
                        color={COLORS.AKCRUBLUE}
                        variant="auth"
                        authButtonWidth={SIZES.ScreenWidth - 32}
                        disabled={!canSave}
                    />
                </View>
                <Modal transparent={true} visible={isCommenting} animationType="fade">
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.PINK} />
                        <Text style={stylesProgress.loadingText}>Saving Changes...</Text>
                    </View>
                </Modal>
            </SafeAreaView>
        </TabContainer>
    );
};

export default EditPollCommentScreen;

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
