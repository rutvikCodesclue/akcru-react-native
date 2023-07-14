import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import React, {useCallback, useRef, useState, useEffect} from 'react';
import { COLORS, FONTS, SIZES } from '../../../assets/constants';
import styles from './styles';
import {Icon} from '@rneui/base';
// import styles from "./Styles/styles";
import imageindex from '../../../assets/images/imageindex';
import LinearGradient from 'react-native-linear-gradient';
import AkcruButtons from '../akcruButtons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ClientStackParams} from '../../navigation/ClientStack';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import YoutubePlayer from 'react-native-youtube-iframe';
// import * as ScreenOrientation from 'expo-screen-orientation';

//import { ResizeMode, Video } from 'expo-av';
// import {Video, ResizeMode} from 'expo-av';

type MovieDetailCardProps = {
  name: string;
  year: number;
  length: string;
  rated: string;
  rating: number;
  desc: string;
  actors: string;
  directors: string;
  id: string;
  youtubetrailer: string;
  portrait_poster: string;
  landscape_poster: string;
  movie_url: string;
  genre1: string;
  genre2: string;
  onPress: () => void;
};

const MovieDetailCardCopy = ({
  id,
  name,
  year,
  length,
  rated,
  rating,
  desc,
  actors,
  directors,
  youtubetrailer,
  portrait_poster,
  landscape_poster,
  movie_url,
  genre1,
  genre2,
  onPress,
}: MovieDetailCardProps) => {
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({}); //Video Player Status

//   function setOrientation() {
//     if (Dimensions.get('window').height > Dimensions.get('window').width) {
//       //Device is in portrait mode, rotate to landscape mode.
//       ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
//     } else {
//       //Device is in landscape mode, rotate to portrait mode.
//       ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
//     }
//   }

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientStackParams>>();

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

  //Point system

  // const [points, setPoints] = useState(0);

  // const updatePoints = () => {
  //   setPoints(prevPoints => prevPoints + 1);
  // };

  // useEffect(() => {
  //   const interval = setInterval(updatePoints, 60000); // Update points every minute
  //   return () => clearInterval(interval); // Clean up the interval on component unmount
  // }, []);

  return (
    <View>
      <View>
        <View>
          <Image
            source={{uri: portrait_poster}}
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
              <Icon
                name="chevron-back"
                type="ionicon"
                size={20}
                color={COLORS.LIGHTGREY}
              />
              <Text style={{...FONTS.Title3, marginLeft: 5}}>Back</Text>
            </View>
          </TouchableOpacity>
          <View style={{position: 'absolute', left: 0, right: 0, bottom: 150}}>
            <View style={styles.videocontain}>
              {/* <View>
                <Video
                  ref={video}
                  source={{
                    uri: movie_url,
                  }}
                  posterSource={{uri: landscape_poster}}
                  usePoster={true}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  onFullscreenUpdate={setOrientation}
                  volume={100}
                  onPlaybackStatusUpdate={(status: {}) =>
                    setStatus(() => status)
                  }
                  style={styles.videoplayer}
                />
              </View> */}
            </View>
          </View>
          <View
            style={{marginBottom: 10, alignItems: 'flex-end', marginRight: 5}}>
            <View
              style={{
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {/* <Text style={{...FONTS.Title2Orange}}>
                Earned Points: {points}
              </Text> */}
              <Text
                style={{
                  ...FONTS.Title3,
                  textAlign: 'center',
                  marginRight: 10,
                }}>
                Add to watchlist
              </Text>
              <TouchableOpacity>
                <Icon
                  name="add-circle-outline"
                  type="ionicon"
                  color={COLORS.MIDORANGE}
                  size={50}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 10,
            }}>
            <AkcruButtons.MedButton
              btnname={status.isPlaying ? 'Pause Movie' : 'Play Movie'}
              onPress={() =>
                status.isPlaying
                  ? video.current.pauseAsync()
                  : video.current.playAsync()
              }
              color={COLORS.AKCRUBLUE}
            />
            <AkcruButtons.MedButton
              btnname={'Watch Trailer'}
              onPress={() => handleSnapPress(1)}
              color={COLORS.TAGCOLOR}
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
            <Text style={{...FONTS.Title3, fontSize: 20}}>{name}</Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'row', marginLeft: 15}}>
              <View style={{marginRight: 25}}>
                <TouchableOpacity>
                  <Icon
                    name="thumb-up-outline"
                    type="material-community"
                    color={'green'}
                    size={SIZES.MedIcon}
                  />
                </TouchableOpacity>
                <Text style={{...FONTS.Title2}}>I Like</Text>
              </View>
              <View>
                <TouchableOpacity>
                  <Icon
                    name="thumb-down-outline"
                    type="material-community"
                    color={'red'}
                    size={SIZES.MedIcon}
                  />
                </TouchableOpacity>
                <Text style={{...FONTS.Title2}}>Nah</Text>
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
              marginRight: 20,
            }}>
            <Text
              style={{
                ...FONTS.Title2,
                color: COLORS.LIGHTGREY,
                marginRight: 10,
              }}>
              {year}
            </Text>
            <Text style={{...FONTS.Title2, color: COLORS.LIGHTGREY}}>
              {length}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <Text style={styles.drawfonttag}>{rated}</Text>
            <Text style={styles.drawfonttag}>{genre1}</Text>

            <Text style={styles.drawfonttag}>{rating}/10</Text>
          </View>
        </View>
        <View style={{marginHorizontal: 15, marginVertical: 10}}>
          <TouchableOpacity onPress={onPress}>
            <View style={styles.MITbutton}>
              <Image source={imageindex.MITticket} style={{marginRight: 10}} />

              <Text style={{...FONTS.Title2AkcruBlue}}>
                Send Movie Invite Ticket
              </Text>
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
          <Text style={{...FONTS.Title2Orange}}>
            Earn up to 500 AKCRU dollars
          </Text>
        </View>

        <View style={{marginHorizontal: 15, marginTop: 15}}>
          <Text
            style={{
              ...FONTS.Title2Orange,
              color: COLORS.LIGHTGREY,
              lineHeight: 18,
              marginBottom: 10,
            }}>
            {desc}
          </Text>
          <View
            style={{flexDirection: 'row', marginBottom: 5, flexWrap: 'wrap'}}>
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
      </View>

      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{backgroundColor: COLORS.AKCRUBACKGROUND}}
        onClose={() => setIsOpen(true)}>
        <BottomSheetScrollView style={{marginHorizontal: 15}}>
          <YoutubePlayer
            height={225}
            play={playing}
            videoId={youtubetrailer}
            onChangeState={onStateChange}
          />
          <View style={{alignItems: 'center'}}>
            <AkcruButtons.LrgButton
              btnname={playing ? 'Pause' : 'Play'}
              onPress={toggleTrailerPlaying}
              color={COLORS.AKCRUBLUE}
            />
          </View>
          <View>
            <Text style={{...FONTS.Title3, fontSize: 20, marginVertical: 15}}>
              {name} - Trailer
            </Text>
          </View>
          <View>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.LIGHTGREY,
                lineHeight: 18,
                marginBottom: 10,
              }}>
              {desc}
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

export default MovieDetailCardCopy;
