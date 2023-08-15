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
  type: 'MIT' | 'CRUView';
  dateID?: any;
  id: string;
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
  dateID,
  type,
  id
}: UserDatesCardProps) => {

const navigation =
  useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  return (
    <View
      style={{
        backgroundColor: "#1C202A",
        borderRadius: 5,
        height: 155,
      }}
    >
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.FADEDBLACK, "transparent", COLORS.FADEDBLACK]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,

          borderRadius: 5,
          height: 155,
        }}
      />
      <View style={{ margin: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginRight: 10 }}>
            <Image source={{ uri: moviePoster }} style={styles.posterstyle} />
          </View>
          <View>
            <Text style={{ ...FONTS.Title2 }}>{movieName}</Text>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ ...FONTS.Title2, fontSize: 12 }}>{movieYear}</Text>
              <Text
                style={{ ...FONTS.Title2, fontSize: 12, marginHorizontal: 10 }}
              >
                {length}
              </Text>
              <Text style={styles.drawfonttag}>{movieRated}</Text>
              <Text style={styles.drawfonttag}>{movieGenre}</Text>
              <Text style={styles.drawfonttag}>{movieRating}/10</Text>
            </View>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", width: 275 }}
            >
              <Text style={styles.paragraphText}>You have a</Text>

              {type === "MIT" && (
                <View style={{ marginHorizontal: 5 }}>
                  <Text style={styles.paragraphText2}>MIT</Text>
                </View>
              )}

              {type === "CRUView" && (
                <View style={{ marginHorizontal: 5 }}>
                  <Text style={styles.paragraphText3}>CRU View</Text>
                </View>
              )}

              <Text style={styles.paragraphText}>scheduled for</Text>
              <View style={{ marginHorizontal: 5 }}>
                <Text style={styles.paragraphText2}>{scheduleDate}</Text>
              </View>

              <Text style={styles.paragraphText}>at</Text>

              {type === "MIT" && (
                <View style={{ marginRight: 5 }}>
                  <Text style={styles.paragraphText2}>{scheduleTime}</Text>
                </View>
              )}

              {type === "CRUView" && (
                <View style={{ marginRight: 5 }}>
                  <Text style={styles.paragraphText2}> {scheduleTime}</Text>
                </View>
              )}

              <Text style={styles.paragraphText}>to watch</Text>
              <View style={{ marginHorizontal: 5 }}>
                <Text style={styles.paragraphText}>"{movieName}"</Text>
              </View>

              <Text style={styles.paragraphText}>with</Text>

              {type === "MIT" && (
                <View>
                  <Text style={styles.paragraphText2}>{scheduleWith}</Text>
                </View>
              )}

              {type === "CRUView" && (
                <View>
                  <Text style={styles.paragraphText3}> your CRU</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={imageindex.AkcruHexLogo}
              style={{ width: 26, height: 26, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text style={styles.paragraphText3}>Earn AD on your date</Text>
          </View>

          {type === "MIT" && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("StartMITDate", {
                  id: dateID,
                  movie: dateID,
                })
              }
            >
              <View
                style={{
                  width: 125,
                  height: 30,
                  backgroundColor: COLORS.AKCRUBLUE,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text style={{ ...FONTS.Title2 }}>Start MIT Date</Text>
              </View>
            </TouchableOpacity>
          )}

          {type === "CRUView" && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("StartCRUViewDate", {
                  id: dateID,
                  movie: dateID,
                })
              }
            >
              <View
                style={{
                  width: 125,
                  height: 30,
                  backgroundColor: COLORS.MIDORANGE,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 3,
                }}
              >
                <Text style={{ ...FONTS.Title2 }}>Start Cru View</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default UserDatesCard;

