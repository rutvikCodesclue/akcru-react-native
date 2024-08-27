import {Text, View, TouchableOpacity, Pressable, FlatList} from 'react-native';
import React from 'react';
import {SIZES, FONTS, COLORS} from '../../../../assets/constants';
import {Icon} from '@rneui/base';
import {HMSVideoViewMode} from '@100mslive/react-native-hms';

interface Props {
    hmsInstanceRef: any;
    peerTrackNodes: any;
    expandedVideo: any;
    setExpandedVideo: any;
    peersMuteStatus: any;
    currentRoomHost: any;
    members: any;
}

const UserVideos = ({
    hmsInstanceRef,
    peerTrackNodes,
    expandedVideo,
    setExpandedVideo,
    peersMuteStatus,
    currentRoomHost,
    members,
}: Props) => {
    return (
        <View
            style={{
                width: SIZES.ScreenWidth * 0.95,
                height: (SIZES.ScreenWidth / 3) * 2.6,
                marginTop: SIZES.ScreenHeight * 0.3,

                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            {hmsInstanceRef.current ? (
                <FlatList
                    scrollEnabled={true}
                    style={{height: '100%', width: '100%'}}
                    key={peerTrackNodes.length}
                    numColumns={3}
                    data={peerTrackNodes}
                    keyExtractor={node => node.id}
                    contentContainerStyle={{flexGrow: 1}}
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

                        return hmsInstanceRef.current ? (
                            <View
                                style={{
                                    width: isExpanded ? SIZES.ScreenWidth * 0.95 : SIZES.ScreenWidth / 3.2,
                                    height: isExpanded ? (SIZES.ScreenWidth / 3) * 2.6 : SIZES.ScreenWidth / 2.5,
                                    backgroundColor: 'red',
                                    flex: isExpanded ? 1 : 0,
                                    position: isExpanded ? 'absolute' : 'relative',
                                    zIndex: isExpanded ? 99 : 0,
                                    bottom: 0,
                                    top: 0,
                                    borderColor: COLORS.CATPURPLGT,
                                    borderWidth: 4,
                                }}>
                                {item.peer.videoTrack?.trackId ? (
                                    <hmsInstanceRef.current.HmsView
                                        key={item.peer.peerID}
                                        trackId={item.peer.videoTrack.trackId}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'black',
                                        }}
                                        scaleType={HMSVideoViewMode.ASPECT_BALANCED}
                                        mirror={true}
                                    />
                                ) : null}

                                {showHostBadge ? (
                                    <View style={{position: 'absolute', top: 0, right: 0}}>
                                        <Text
                                            style={{
                                                ...FONTS.paragraph1,
                                                backgroundColor: COLORS.AKCRUBLUE,
                                                paddingHorizontal: 5,
                                                paddingVertical: 2,
                                                borderBottomLeftRadius: 4,
                                            }}>
                                            {'Host'}
                                        </Text>
                                    </View>
                                ) : null}

                                <View style={{position: 'absolute', top: 0, left: 0}}>
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
                                </View>

                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        backgroundColor: COLORS.TRANSDARKGREY,
                                        width: '100%',
                                        borderTopLeftRadius: 5,
                                        borderTopRightRadius: 5,
                                    }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingHorizontal: 3,
                                            paddingVertical: 5,
                                        }}>
                                        <Text style={{...FONTS.paragraph1, paddingVertical: 4}}>
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
                                                    peersMuteStatus[item.peer.peerID] == true
                                                        ? 'mic-off-circle'
                                                        : 'mic-circle'
                                                }
                                                type="ionicon"
                                                size={25}
                                                color={
                                                    peersMuteStatus[item.peer.peerID] === undefined ||
                                                    peersMuteStatus[item.peer.peerID] == true
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
                <View style={{backgroundColor: '#fff', width: 200, height: 200}}>
                    <Text>Loading...</Text>
                </View>
            )}
        </View>
    );
};

export default UserVideos;
