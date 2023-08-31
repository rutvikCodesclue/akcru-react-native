import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react';
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import styles from './styles';
import imageindex from '../../../assets/images/imageindex';
import { JENNY_SCHEDULE } from '../../../assets/constants/Mockusers'
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserProfileStackParams } from '../../navigation/UserProfileStack';
import { NoBottomTabStackParams } from '../../navigation/NoBottomTabStack';

type UserDatesCardProps = {
    id: string;
    cruId: string;
    isHost: boolean;
    movieId: string;
    moviePoster: string;
    movieName: string;
    length: string;
    movieYear: number;
    movieRated: string;
    movieGenre: string;
    movieGenre2: string;
    movieRating: number;
    scheduleDate: string;
    scheduleTime: string;
    scheduleWith: string;
    type: 'MIT' | 'CRUView';
    dateID?: any;
    onPressin: () => void;
};


const UserDatesCard = ({
    id,
    cruId,
    isHost,
    movieId,
    moviePoster,
    movieName,
    length,
    movieYear,
    movieRated,
    movieGenre,
    movieGenre2,
    movieRating,
    scheduleDate,
    scheduleTime,
    scheduleWith,
    dateID,
    type,
    onPressin
}: UserDatesCardProps) => {

const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

    return (
        <View
            style={{
                backgroundColor: '#1C202A',
                borderRadius: 5,
                height: 250,
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

                    borderRadius: 5,
                    height: 250,
                }}
            />
            <View style={{margin: 10}}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{marginRight: 10}}>
                        <TouchableOpacity onPress={onPressin}>
                            <Image source={{uri: moviePoster}} style={styles.posterstyle} />
                        </TouchableOpacity>
                    </View>
                    <View>
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
                        <View style={{flexDirection: 'row', marginVertical: 5, flexWrap: 'wrap'}}>
                            <Text style={styles.drawfonttag}>{movieRated}</Text>
                            <Text style={styles.drawfonttag}>{movieGenre}</Text>

                            <Text style={styles.drawfonttag}>{movieRating}/10</Text>
                        </View>
                    </View>
                </View>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
                    <Text style={styles.paragraphText}>You have a</Text>

                    {type === 'MIT' && (
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

                    <Text style={styles.paragraphText}>at</Text>
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

                    {type === 'MIT' && (
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
                    {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                            source={imageindex.AkcruHexLogo}
                            style={{width: 26, height: 26, marginRight: 8}}
                            resizeMode="contain"
                        />
                        <Text style={styles.paragraphText3}>Earn AD on your date</Text>
                    </View> */}
                    <TouchableOpacity
                        onPress={() =>{''}
                        }>
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
                    </TouchableOpacity>

                    {type === 'MIT' && (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('StartMITDate', {
                                    id: id,
                                    movie: movieId,
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
                                navigation.navigate('RoomPreview', {
                                    id,
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

