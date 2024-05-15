import {View, Text, TouchableOpacity, Image, Modal, Pressable} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {Avatar, Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';
import {formatDatestamp, formatTimestampToAMPM} from '../../util/util';

type User = {
    id: string;
    username: string;
    name: string;
    image?: string;
    akcruBadge?: string;
    avatarbordercolor?: string;
    influencer?: string;
};

type MessageType = {
    id: string;
    content: string;
    user: User;
    createdAt: string;
    image: string;
};

type MessageProps = {
    post: MessageType;
    InviterUserName: string;
    InviterPicture: string;
};

const MITMessages = ({post, InviterUserName, InviterPicture}: MessageProps) => {
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const [isPostOptionsVisible, setPostOptionsVisible] = useState(false);

    const openModal = (image: React.SetStateAction<string>) => {
        setSelectedImage(image);
        setImageModalVisible(true);
    };

    const closeModal = () => {
        setImageModalVisible(false);
    };

    const openPostOptions = () => {
        setPostOptionsVisible(true);
    };

    const closePostOptions = () => {
        setPostOptionsVisible(false);
    };

    return (
        <View style={styles.cardcontainer}>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <View style={{marginRight: 8}}>
                    <TouchableOpacity>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: InviterPicture,
                            }}
                            avatarStyle={{
                                borderWidth: 2,
                                borderColor: post.user.avatarbordercolor,
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{...FONTS.Title2, fontSize: 12}}>{InviterUserName}</Text>
                        {post.user.influencer && (
                            <Icon
                                name="ribbon"
                                type="ionicon"
                                color={COLORS.AKCRUBLUE}
                                size={15}
                                style={{marginLeft: 5}}
                            />
                        )}
                    </View>

                    {post.user.akcruBadge.akcruit && (
                        <View>
                            <AkcruLevels.AkcruBadgeAkcruit />
                        </View>
                    )}
                    {post.user.akcruBadge.guardian && (
                        <View>
                            <AkcruLevels.AkcruBadgeGuardian />
                        </View>
                    )}
                    {post.user.akcruBadge.hero && (
                        <View>
                            <AkcruLevels.AkcruBadgeHero />
                        </View>
                    )}
                    {post.user.akcruBadge.superhero && (
                        <View>
                            <AkcruLevels.AkcruBadgeSuperHero />
                        </View>
                    )}
                </View>
                <View style={{marginLeft: 'auto', flexDirection: 'row', alignItems: 'center'}}>
                    <View>
                        <Pressable onPress={openPostOptions}>
                            <Icon
                                name="ellipsis-horizontal"
                                type="ionicon"
                                color={COLORS.MIDORANGE}
                                size={20}
                                style={{alignSelf: 'flex-end'}}
                            />
                        </Pressable>
                        <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.PURPLE}}>
                            {formatDatestamp(post.createdAt)}
                        </Text>
                        <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.DARKGREY, textAlign: 'right'}}>
                            {formatTimestampToAMPM(post.createdAt)}
                        </Text>
                    </View>
                </View>

                <Modal visible={isPostOptionsVisible} transparent={true} animationType="slide">
                    <Pressable style={styles.postoptioncontainer} onPress={closePostOptions}>
                        <View style={styles.postoptionsmodal}>
                            <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                                <Icon
                                    name="person-add"
                                    type="ionicon"
                                    color={COLORS.MIDORANGE}
                                    size={20}
                                    style={{marginLeft: 5}}
                                />
                                <Text style={{...FONTS.Title2, paddingLeft: 12}}>Follow {InviterUserName}</Text>
                            </Pressable>
                            <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                                <Icon
                                    name="hand-left"
                                    type="ionicon"
                                    color={COLORS.MIDORANGE}
                                    size={20}
                                    style={{marginLeft: 5}}
                                />
                                <Text style={{...FONTS.Title2, paddingLeft: 12}}>Block {InviterUserName}</Text>
                            </Pressable>
                            <Pressable style={{flexDirection: 'row', alignItems: 'center', marginBottom: 15}}>
                                <Icon
                                    name="flag"
                                    type="ionicon"
                                    color={COLORS.MIDORANGE}
                                    size={20}
                                    style={{marginLeft: 5}}
                                />
                                <Text style={{...FONTS.Title2, paddingLeft: 12}}>Report {InviterUserName}</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Modal>
            </View>

            <Text style={styles.post}>{post.content}</Text>

            <View>
                {post.image && (
                    <TouchableOpacity onPress={() => openModal(post.image)}>
                        <Image src={post.image} style={styles.postimage} />
                    </TouchableOpacity>
                )}
            </View>

            <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}>
                    <Image source={{uri: selectedImage}} style={{width: '95%', height: '95%'}} resizeMode="contain" />
                    <TouchableOpacity onPress={closeModal}>
                        <Text style={{color: COLORS.MIDORANGE, fontSize: 14, marginTop: 20}}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default MITMessages;
