import {View, Text, TouchableOpacity, Image, Modal, Pressable} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {Avatar, Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';

type FooterIconsProps = {
    iconname: string;
    text?: string | number;
    onPress: () => void;
};

const FooterIcons = ({iconname, text, onPress}: FooterIconsProps) => {
    return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={onPress}>
                <Icon name={iconname} type="ionicon" color={COLORS.PURPLE} size={18} />
            </TouchableOpacity>
            <Text style={{...FONTS.Title2, fontSize: 12, marginLeft: 5}}>{text}</Text>
        </View>
    );
};

type User = {
    id: string;
    username: string;
    name: string;
    image?: string;
    akcruBadge?: string;
    avatarbordercolor?: string;
    influencer?: string;
};

type PostType = {
    id: string;
    content: string;
    user: User;
    createdAt: string;
    image: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    numberOfLikes?: number;
    impressions?: number;
};

type PostProps = {
    post: PostType;
};

const SkinnyPostCard = ({post }: PostProps) => {
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const openModal = (image: React.SetStateAction<string>) => {
        setSelectedImage(image);
        setImageModalVisible(true);
    };

    const closeModal = () => {
        setImageModalVisible(false);
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
                                uri: post.user.image,
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
                        <Text style={{...FONTS.Title2, fontSize: 12}}>{post.user.name}</Text>
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
                    <Text style={{...FONTS.Title2, fontSize: 12, color: COLORS.PURPLE, marginRight: 10}}>•2h ago</Text>
                    <TouchableOpacity>
                        <Icon name="ellipsis-horizontal" type="ionicon" color={COLORS.PURPLE} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.post}>{post.content}</Text>

            <View>
                {post.image && (
                    <TouchableOpacity onPress={() => openModal(post.image)}>
                        <Image src={post.image} style={styles.postimage} />
                    </TouchableOpacity>
                )}
            </View>
            {/* Modal */}
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
            <View style={styles.postfooter}>
                <FooterIcons
                    iconname={'chatbox'}
                    text={post.numberOfComments || 0}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons
                    iconname={'happy'}
                    text={post.numberOfLikes || 0}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons
                    iconname={'sync'}
                    text={post.numberOfReposts || 0}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons
                    iconname={'stats-chart'}
                    text={post.impressions || 0}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons
                    iconname={'share-social'}
                    onPress={() => {
                        ('');
                    }}
                />
            </View>
        </View>
    );
};

export default SkinnyPostCard;
