import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Pressable,
  Modal,
  StatusBar,
} from 'react-native';
import React, {useCallback, useRef, useState, useEffect} from 'react';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import styles from './styles';
import {Icon} from '@rneui/base';
import imageindex from '../../../assets/images/imageindex';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../akcruButtons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import YoutubePlayer from 'react-native-youtube-iframe';
import { formatMovieDuration } from '../../util/util';
import { capitalizeFirstLetterOfString } from '../../util/util';
import Video, {OnSeekData} from 'react-native-video';
import VideoPlayer from 'react-native-media-console';

type MovieDetailCardProps = {
    title: string;
    year: number;
    duration: number;
    rated: string;
    rating: number;
    description: string;
    actors: string;
    directors: string;
    id: string;
    trailerURL: string;
    portraitURL: string;
    landscapeURL: string;
    movieURL: string;
    genre1: string;
    genre2: string;
    onPress: () => void;
    onPressin: () => void;
    showAddToWatchListConfirmationModal: boolean;
    handleCancelAddToWatchList: () => void;
    handleConfirmAddToWatchList: () => void;
    onPressOut: () => void;
    PlayTrailer: () => void;
};

const MovieDetailCard = ({
    id,
    title,
    year,
    duration,
    rated,
    rating,
    description,
    actors,
    directors,
    trailerURL,
    portraitURL,
    landscapeURL,
    movieURL,
    genre1,
    genre2,
    onPress,
    onPressin,
    onPressOut,
    showAddToWatchListConfirmationModal,
    handleCancelAddToWatchList,
    handleConfirmAddToWatchList,
    PlayTrailer
}: MovieDetailCardProps) => {
    const video = React.useRef<Video>(null);
    const [status, setStatus] = React.useState({}); //Video Player Status

    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParams>>();

     

    const [trailerModal, setTrailerModal] = useState(false)


    const sheetRef = useRef<BottomSheet>(null); //Pop up trailer
    const [isOpen, setIsOpen] = useState(false);

    const snapPoints = ['1', '75'];

    const handleSnapPress = useCallback((index: number) => {
        sheetRef.current?.snapToIndex(index);
        setIsOpen(true);
    }, []);

    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
            Alert.alert('Trailer has finished playing!');
        }
    }, []);

    const toggleTrailerPlaying = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

    const onPlay = () => {
        setPlaying(true);
        // Hide the status bar when the movie starts playing
        StatusBar.setHidden(true);
    };
    const onPause = () => {
        setPlaying(false);
        // Show the status bar when the movie is paused
        StatusBar.setHidden(false);
    };


    return (
        <View>
            <View>
                <View>
                    <Image
                        source={{uri: portraitURL}}
                        style={{
                            height: SIZES.ScreenHeight / 1.5,
                        }}
                        resizeMode="cover"
                    />
                </View>

                <View
                    style={{
                        height: 200,
                        justifyContent: 'flex-end',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}>
                    <LinearGradient
                        // Background Linear Gradient
                        colors={[COLORS.BLACK, 'transparent', COLORS.AKCRUBACKGROUND]}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: SIZES.ScreenHeight / 1.5,
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => navigation.pop()}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: -250,
                            marginHorizontal: 15,
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <Icon name="chevron-back" type="ionicon" size={20} color={COLORS.LIGHTGREY} />
                            <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{marginBottom: 10, alignItems: 'flex-end', marginRight: 5}}>
                        <View
                            style={{
                                justifyContent: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            {/* <Text
                                style={{
                                    ...FONTS.Title3,
                                    textAlign: 'center',
                                    marginRight: 10,
                                }}>
                                Add to watchlist
                            </Text> */}
                            <Pressable onPressOut={onPressOut}>
                                {/* <Icon name="add-circle-outline" type="ionicon" color={COLORS.MIDORANGE} size={45} /> */}
                            </Pressable>
                        </View>
                    </View>

                    {/* Add to watchlist Confirmation Modal */}
                    <Modal animationType="fade" transparent={true} visible={showAddToWatchListConfirmationModal}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                            <View
                                style={{
                                    backgroundColor: COLORS.AKCRUBACKGROUND,
                                    padding: 20,
                                    borderRadius: 10,
                                }}>
                                <View>
                                    <Text
                                        style={{
                                            ...FONTS.Title3,
                                            marginBottom: 10,
                                            textAlign: 'center',
                                        }}>
                                        {`Are you sure you want to add "${title}" to your watchlist?`}
                                    </Text>
                                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: COLORS.CATREDLGT,
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                                marginRight: 10,
                                                borderRadius: 5,
                                            }}
                                            onPress={handleCancelAddToWatchList}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: COLORS.GREEN,
                                                paddingHorizontal: 20,
                                                paddingVertical: 10,
                                                borderRadius: 5,
                                            }}
                                            onPress={handleConfirmAddToWatchList}>
                                            <Text style={{...FONTS.Title3, color: COLORS.WHITE}}>Add To List</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginHorizontal: 10,
                        }}>
                        <AkcruButtons.MedButton
                            btnname={'Play Movie'}
                            onPress={onPressin}
                            color={COLORS.AKCRUBLUE}
                            disabled={false}
                        />

                        <AkcruButtons.MedButton
                            btnname={'Watch Trailer'}
                            onPress={PlayTrailer}
                            color={COLORS.TAGCOLOR}
                            disabled={false}
                        />
                    </View>
                </View>
            </View>

            <View style={{marginTop: 20, marginBottom: 15}}>
                <View
                    style={{
                        flexDirection: 'row',
                        marginHorizontal: 15,
                        justifyContent: 'space-between',
                        marginBottom: 10,
                    }}>
                    <View style={{width: 175}}>
                        <Text style={{...FONTS.Title3, fontSize: 20}}>{title}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flexDirection: 'row', marginLeft: 15}}>
                            <View style={{marginRight: 25}}>
                                {/* <TouchableOpacity>
                                    <Icon
                                        name="thumb-up-outline"
                                        type="material-community"
                                        color={'green'}
                                        size={SIZES.MedIcon}
                                    />
                                </TouchableOpacity>
                                <Text style={{...FONTS.Title2}}>I Like</Text> */}
                            </View>
                            <View>
                                {/* <TouchableOpacity>
                                    <Icon
                                        name="thumb-down-outline"
                                        type="material-community"
                                        color={'red'}
                                        size={SIZES.MedIcon}
                                    />
                                </TouchableOpacity>
                                <Text style={{...FONTS.Title2}}>Nah</Text> */}
                            </View>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        marginHorizontal: 15,
                        flexDirection: 'row',

                        marginVertical: 5,
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignSelf: 'center',
                            marginRight: 10,
                        }}>
                        <Text
                            style={{
                                ...FONTS.Title2,
                                color: COLORS.LIGHTGREY,
                                marginRight: 10,
                            }}>
                            {year}
                        </Text>
                        <Text style={{...FONTS.Title2, color: COLORS.LIGHTGREY}}>{formatMovieDuration(duration)}</Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                        }}>
                        <Text style={styles.drawfonttag}>{rated}</Text>
                        <Text style={styles.drawfonttag}>{capitalizeFirstLetterOfString(genre1)}</Text>
                        <Text style={styles.drawfonttag}>{capitalizeFirstLetterOfString(genre2)}</Text>
                        <Text style={styles.drawfonttag}>
                            {/* <Icon name="star" type="ionicon" size={12} color={COLORS.BLACK} style={{marginRight: 5}} /> */}
                            {rating}/10
                        </Text>
                    </View>
                </View>
                <View style={{marginHorizontal: 15, marginVertical: 10}}>
                    <TouchableOpacity onPress={onPress}>
                        <View style={styles.MITbutton}>
                            <Image source={imageindex.MITticket} style={{marginRight: 10}} />

                            <Text style={{...FONTS.Title2AkcruBlue}}>Send Movie Invite Ticket</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                    }}>
                    <Image
                        source={imageindex.AkcruHexLogo}
                        style={{width: 26, height: 26, marginRight: 10}}
                        resizeMode="contain"
                    />
                    <Text style={{...FONTS.Title2Orange}}>Earn up to 500 AKCRU dollars</Text>
                </View>

                <View style={{marginHorizontal: 15, marginTop: 15}}>
                    <Text
                        style={{
                            ...FONTS.Title2Orange,
                            color: COLORS.LIGHTGREY,
                            lineHeight: 18,
                            marginBottom: 10,
                        }}>
                        {description}
                    </Text>
                    <View style={{flexDirection: 'row', marginBottom: 5}}>
                        <Text
                            style={{
                                ...FONTS.Title2Orange,
                                color: COLORS.AKCRUBLUE,
                            }}>
                            <Text style={{color: COLORS.DARKGREY}}>Cast:</Text> {actors}
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        <Text
                            style={{
                                ...FONTS.Title2Orange,
                                color: COLORS.AKCRUBLUE,
                            }}>
                            <Text style={{color: COLORS.DARKGREY}}>Directors:</Text> {directors}
                        </Text>
                    </View>
                </View>
            </View>
            {/* <Modal>
                <View>

                </View>
            </Modal> */}

            <BottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
                onClose={() => setIsOpen(false)}>
                <BottomSheetScrollView style={{marginHorizontal: 15}}>
                    <View style={{height: 175}}>
                        <VideoPlayer
                            source={{
                                uri: trailerURL,
                            }}
                            disableBack
                            toggleResizeModeOnFullscreen={true}
                            // onChangeState={onStateChange}
                            poster={landscapeURL}
                            onPlay={onPlay}
                            onPause={onPause}
                            containerStyle={{zIndex: 100}}
                           videoRef={video}
                        />
                    </View>

                    <View style={{alignItems: 'center'}}>
                        <AkcruButtons.LrgButton
                            btnname={playing ? 'Pause' : 'Play'}
                            onPress={toggleTrailerPlaying}
                            color={COLORS.AKCRUBLUE}
                            disabled={true}
                        />
                    </View>
                    <View>
                        <Text style={{...FONTS.Title3, fontSize: 20, marginVertical: 15}}>{title} - Trailer</Text>
                    </View>
                    <View>
                        <Text
                            style={{
                                ...FONTS.Title2Orange,
                                color: COLORS.LIGHTGREY,
                                lineHeight: 18,
                                marginBottom: 10,
                            }}>
                            {description}
                        </Text>
                        <View style={{flexDirection: 'row', marginBottom: 5}}>
                            <Text
                                style={{
                                    ...FONTS.Title2Orange,
                                    color: COLORS.DARKGREY,
                                    marginRight: 10,
                                }}>
                                Cast:
                            </Text>
                            <Text
                                style={{
                                    ...FONTS.Title2Orange,
                                    color: COLORS.AKCRUBLUE,
                                }}>
                                {actors}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'row'}}>
                            <Text
                                style={{
                                    ...FONTS.Title2Orange,
                                    color: COLORS.DARKGREY,
                                    marginRight: 10,
                                }}>
                                Director:
                            </Text>
                            <Text
                                style={{
                                    ...FONTS.Title2Orange,
                                    color: COLORS.AKCRUBLUE,
                                }}>
                                {directors}
                            </Text>
                        </View>
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    );
};

export default MovieDetailCard;
