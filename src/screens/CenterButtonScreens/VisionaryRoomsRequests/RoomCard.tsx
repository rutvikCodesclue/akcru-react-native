import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { COLORS, FONTS } from "../../../../assets/constants";
import styles from "./styles";
import imageindex from "../../../../assets/images/imageindex";
import moment from "moment";
import AkcruButtons from "../../../components/akcruButtons";
import { getShortenedTimezone } from "../../../util/util";

type UserDatesCardProps = {
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
    timezone: string;
    seeMovie: () => void;
    visitCreator: () => void;
    acceptRequest: () => void;
    declineRequest: () => void;
};

const UserDatesCard = ({
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
    timezone,
    seeMovie,
    visitCreator,
    acceptRequest,
    declineRequest,
}: UserDatesCardProps) => {
    return (
        <View
            style={{
                backgroundColor: COLORS.SURFACE_ELEVATED,
                borderRadius: 5,
                justifyContent: 'center',
                marginBottom: 15,
            }}>
            <LinearGradient
                colors={[COLORS.FADEDBLACK, COLORS.TRANSPARENT, COLORS.FADEDBLACK]}
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
                        <TouchableOpacity onPress={() => seeMovie()}>
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
                            <Text style={{...FONTS.paragraph1}}>{movieYear}</Text>
                            <Text style={{...FONTS.paragraph1, marginHorizontal: 10}}>{length}</Text>
                        </View>
                        <View style={{flexDirection: 'row', marginVertical: 5}}>
                            <Text style={styles.drawfonttag}>{movieRated}</Text>
                            <Text style={styles.drawfonttag}>{movieGenre}</Text>

                            <Text style={styles.drawfonttag}>{movieRating}/10</Text>
                        </View>
                    </View>
                    <View style={{flex: 1}}>
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                            <Image source={imageindex.NewCru} style={{width: '70%', height: '62%'}} />
                        </View>
                    </View>
                </View>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
                    <TouchableOpacity onPress={() => visitCreator()}>
                        <View>
                            <Text style={styles.paragraphText4}> {scheduleWith}</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.paragraphText}>wants to create a</Text>

                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText3}>Visionary Room</Text>
                    </View>

                    <Text style={styles.paragraphText}>scheduled for</Text>

                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText2}>
                            {moment(scheduleDate).tz(timezone).format('ddd, MMM Do')}
                        </Text>
                    </View>

                    <Text style={styles.paragraphText}>at </Text>

                    <View style={{marginRight: 5}}>
                        <Text style={styles.paragraphText2}>
                            {moment(scheduleTime).tz(timezone).format('h:mm A')} {getShortenedTimezone(timezone)}
                        </Text>
                    </View>

                    <Text style={styles.paragraphText}>. Would you like to accept or decline their request?</Text>
                    <View style={{marginHorizontal: 5}}>
                        <Text style={styles.paragraphText}>"{movieName}"</Text>
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                    }}>
                        <AkcruButtons.SmallButton
                            onPress={() => declineRequest()}
                            btnname="Decline"
                            color={COLORS.CATREDDRK}
                            disabled={false}
                        />
                        <AkcruButtons.SmallButton
                            onPress={() => acceptRequest()}
                            btnname="Accept"
                            color={COLORS.AKCRUBLUE}
                            disabled={false}
                        />
                </View>
            </View>
        </View>
    );
};

export default UserDatesCard;
