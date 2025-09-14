import {Text, View, TouchableOpacity, Pressable, FlatList, StyleSheet, ImageBackground} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {HMSVideoViewMode} from '@100mslive/react-native-hms';
import {MemberInfo, UserVideosProps} from './WatchPartyProps';

const UserVideos = ({
    currentHmsInstance,
    peerTrackNodes,
    expandedVideo,
    setExpandedVideo,
    peersMuteStatus,
    currentRoomHost,
    members,
    videoRoomPrivileges,
}: UserVideosProps) => {
    const filteredPeerTrackNodes = peerTrackNodes.filter(node =>
  members.some(member => member.peerID === node.peer.peerID)
);
    return (
        <View style={styles.container}>
            {currentHmsInstance ? (
                <FlatList
                    scrollEnabled={true}
                    style={styles.flatList}
                    key={peerTrackNodes.length}
                    numColumns={3}
                    data={filteredPeerTrackNodes}
                    keyExtractor={node => node.id}
                    contentContainerStyle={styles.contentContainer}
                    renderItem={({item}) => {
                        const isExpanded = expandedVideo === item;
                        let showHostBadge = false;
                        if (members.length > 0) {
                            const target = members
                                ? members.find(member => member.user.id === currentRoomHost)
                                : undefined;
                            if (target) {
                                if (target.peerID === item.peer.peerID) {
                                    showHostBadge = true;
                                }
                            }
                        }

                        const profilePic =
                        members.find(member => member.peerID === item.peer.peerID)?.user
                            .profilePicture;

                        return currentHmsInstance ? (
                            <View
                                style={[
                                    styles.videoContainer,
                                    isExpanded ? styles.expandedVideoContainer : styles.collapsedVideoContainer,
                                ]}>
                                    
                                {(videoRoomPrivileges && item.peer.videoTrack?.trackId) ? (
                                    <currentHmsInstance.HmsView
                                        key={item.peer.peerID}
                                        trackId={item.peer.videoTrack.trackId}
                                        style={styles.hmsView}
                                        scaleType={HMSVideoViewMode.ASPECT_BALANCED}
                                        mirror={true}
                                    />
                                ) : null}

                                {!videoRoomPrivileges && (
                                    <ImageBackground
                                        source={{uri: profilePic}}
                                        style={styles.hmsView}
                                        imageStyle={{resizeMode: 'cover'}} // controls scaling
                                    />
                                )}

                                {showHostBadge ? (
                                    <View style={styles.hostBadge}>
                                        <Text style={styles.hostBadgeText}>{'Host'}</Text>
                                    </View>
                                ) : null}

                                {/* <View style={styles.expandIconContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isExpanded) {
                                                setExpandedVideo(null);
                                            } else {
                                                if (expandedVideo) {
                                                    setExpandedVideo(null);
                                                }
                                                setExpandedVideo(item);
                                            }
                                        }}>
                                        {isExpanded ? (
                                            <Icon name="contract" type="ionicon" size={30} color={COLORS.AKCRUBLUE} />
                                        ) : (
                                            <Icon name="expand" type="ionicon" size={23} color={COLORS.AKCRUBLUE} />
                                        )}
                                    </TouchableOpacity>
                                </View> */}

                                <View style={styles.muteStatusContainer}>
                                    <View style={styles.muteStatusContent}>
                                        <Text style={styles.peerName}>
                                            {isExpanded
                                                ? item.peer.name
                                                : item.peer.name.length > 8
                                                ? item.peer.name.substring(0, 8) + '...'
                                                : item.peer.name}
                                        </Text>
                                        <Pressable>
                                            <Icon
                                                name={
                                                    peersMuteStatus[item.peer.peerID] === undefined ||
                                                    peersMuteStatus[item.peer.peerID] === true
                                                        ? 'mic-off-circle'
                                                        : 'mic-circle'
                                                }
                                                type="ionicon"
                                                size={25}
                                                color={
                                                    peersMuteStatus[item.peer.peerID] === undefined ||
                                                    peersMuteStatus[item.peer.peerID] === true
                                                        ? COLORS.CATREDLGT
                                                        : COLORS.GREEN
                                                }
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ) : null;
                    }}
                />
            ) : (
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SIZES.ScreenWidth * 0.95,
        height: (SIZES.ScreenWidth / 3) * 2.6,
        marginTop: SIZES.ScreenHeight * 0.3,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: {
        height: '100%',
        width: '100%',
    },
    contentContainer: {
        flexGrow: 1,
    },
    videoContainer: {
        borderColor: COLORS.CATPURPLGT,
        borderWidth: 4,
    },
    expandedVideoContainer: {
        width: SIZES.ScreenWidth * 0.95,
        height: (SIZES.ScreenWidth / 3) * 2.6,
        flex: 1,
        position: 'absolute',
        zIndex: 99,
        bottom: 0,
        top: 0,
    },
    collapsedVideoContainer: {
        width: SIZES.ScreenWidth / 3.2,
        height: SIZES.ScreenWidth / 2.5,
        flex: 0,
        position: 'relative',
        zIndex: 0,
    },
    hmsView: {
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
    },
    hostBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    hostBadgeText: {
        ...FONTS.paragraph1,
        backgroundColor: COLORS.AKCRUBLUE,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderBottomLeftRadius: 4,
    },
    expandIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    muteStatusContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: COLORS.TRANSDARKGREY,
        width: '100%',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    muteStatusContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 3,
        paddingVertical: 5,
    },
    peerName: {
        ...FONTS.paragraph1,
        paddingVertical: 4,
    },
    loadingContainer: {
        backgroundColor: '#fff',
        width: 200,
        height: 200,
    },
});

export default UserVideos;
