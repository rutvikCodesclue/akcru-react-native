import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react';
import {COLORS, FONTS} from '../../../assets/constants';
import styles from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from '../../navigation/UserProfileStack';
import imageindex from '../../../assets/images/imageindex';
import moment from 'moment-timezone';

type UserDatesCardProps = {
    id: string;
    type: 'MITInvite' | 'CRUView';
    cruId?: string;
    userId?: string;
    isHost: boolean;
    movieId: string;
    moviePoster: string;
    movieName: string;
    length: string;
    movieYear: number;
    movieRated: string;
    movieGenre: string;
    movieRating: number;
    scheduleDate: string;
    scheduleTime: string;
    scheduleWith: string;
    onPressin: () => void;
    timezone: string;
};


const UserDatesCard = ({
    id,
    cruId,
    userId,
    isHost,
    movieId,
    moviePoster,
    movieName,
    length,
    movieYear,
    movieRated,
    movieGenre,
    movieRating,
    scheduleDate,
    scheduleTime,
    scheduleWith,
    type,
    onPressin,
    timezone
}: UserDatesCardProps) => {

const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    return (
        <View
            style={{
                backgroundColor: '#1C202A',
                borderRadius: 5,
                justifyContent: 'center',
            }}>
            <LinearGradient
                // Background Linear Gradient
                colors={[COLORS.FADEDBLACK, 'transparent', COLORS.FADEDBLACK]}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 5,
                }}
            />
            <View style={{margin: 10}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginRight: 10}}>
                        <TouchableOpacity onPress={onPressin}>
                            <Image source={{uri: moviePoster}} style={styles.posterstyle} />
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '50%'}}>
                        <Text style={{...FONTS.Title2}}>{movieName}</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginBottom: 5,
                                alignItems: 'center',
                            }}>
                            <Text style={{...FONTS.Title2, fontSize: 12}}>{movieYear}</Text>
                            <Text style={{...FONTS.Title2, fontSize: 12, marginHorizontal: 10}}>{length}</Text>
                        </View>
                        <View style={{flexDirection: 'row', marginVertical: 5, }}>
                            <Text style={styles.drawfonttag}>{movieRated}</Text>
                            <Text style={styles.drawfonttag}>{movieGenre}</Text>

                            <Text style={styles.drawfonttag}>{movieRating}/10</Text>
                        </View>
                    </View>
                    <View style={{flex: 1}}>
                        {type === 'MITInvite' && (
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                <Image source={imageindex.LrgMIT} style={{width: '60%', height: '35%'}} />
                            </View>
                        )}

                        {type === 'CRUView' && (
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                <Image source={imageindex.NewCru} style={{width: '70%', height: '62%'}} />
                            </View>
                        )}
                    </View>
                </View>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
                    <Text style={styles.paragraphText}>You have a</Text>

                    {type === 'MITInvite' && (
                        <View style={{marginHorizontal: 5}}>
                            <Text style={styles.paragraphText2}>MIT</Text>
                        </View>
                    )}

                    {type === 'CRUView' && (
                        <View style={{marginHorizontal: 5}}>
                            <Text style={styles.paragraphText3}>CRU View</Text>
                        </View>
                    )}

                    <Text style={styles.paragraphText}>scheduled for</Text>
                    {/* DATE */}
                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText2}>
                            {new Date(scheduleDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>

                    <Text style={styles.paragraphText}>at </Text>
                    {/* TIME */}
                    <View style={{marginRight: 5}}>
                        <Text style={styles.paragraphText2}>
                            {new Date(scheduleTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                            })}
                        </Text>
                    </View>

                    <Text style={styles.paragraphText}>to watch</Text>
                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText}>"{movieName}"</Text>
                    </View>

                    <Text style={styles.paragraphText}>with </Text>

                    {type === 'MITInvite' && (
                        <View>
                            <Text style={styles.paragraphText2}> {scheduleWith}</Text>
                        </View>
                    )}

                    {type === 'CRUView' && (
                        <View>
                            <Text style={styles.paragraphText3}> {scheduleWith}</Text>
                        </View>
                    )}
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}>
                    {/* <TouchableOpacity
                        onPress={() => {
                            ('');
                        }}>
                        <View
                            style={{
                                width: 125,
                                height: 30,
                                backgroundColor: COLORS.CATREDLGT,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 3,
                            }}>
                            <Text style={{...FONTS.Title2}}>Cancel Date</Text>
                        </View>
                    </TouchableOpacity> */}

                    {type === 'MITInvite' && (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('WatchPartyPreview', {
                                    id,
                                    type,
                                    userId,
                                    movieId,
                                    isHost,
                                })
                            }>
                            <View
                                style={{
                                    width: 125,
                                    height: 30,
                                    backgroundColor: COLORS.AKCRUBLUE,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 3,
                                }}>
                                <Text style={{...FONTS.Title2}}>Start MIT Date</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {type === 'CRUView' && (
                        <TouchableOpacity
                            onPress={() =>
                                // TODO: navigate to WatchPartyPreviewScreen
                                navigation.navigate('WatchPartyPreview', {
                                    id,
                                    type,
                                    movieId,
                                    isHost,
                                    cruId,
                                })
                            }>
                            <View
                                style={{
                                    width: 125,
                                    height: 30,
                                    backgroundColor: COLORS.MIDORANGE,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 3,
                                }}>
                                <Text style={{...FONTS.Title2}}>Start Cru View</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export default UserDatesCard;

