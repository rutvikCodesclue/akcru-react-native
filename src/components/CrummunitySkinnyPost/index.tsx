import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import styles from './styles';
import {Avatar, Icon} from '@rneui/base';
import {COLORS, FONTS} from '../../../assets/constants';
import AkcruLevels from '../akcruBadges';

type FooterIconsProps ={
    iconname: string;
    text?: string | number;
    onPress: () => void
}

const FooterIcons = ({iconname, text, onPress}: FooterIconsProps) => {
    return (
               <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity onPress={onPress}>
                        <Icon name={iconname} type="ionicon" color={COLORS.PURPLE} size={18} />
                    </TouchableOpacity>
                    <Text style={{...FONTS.Title2, fontSize: 12, marginLeft: 5}}>{text}</Text>
                </View>
    )
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

const SkinnyPostCard = ({post}: PostProps) => {
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
            <View>{post.image && <Image src={post.image} style={styles.postimage} />}</View>
            <View style={styles.postfooter}>
                <FooterIcons
                    iconname={'chatbox'}
                    text={post.numberOfComments}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons
                    iconname={'happy'}
                    text={post.numberOfLikes}
                    onPress={() => {
                        ('');
                    }}
                />
                <FooterIcons
                    iconname={'sync'}
                    text={post.numberOfReposts}
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
