import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS, FONTS, SIZES } from '../../constants'
import imageindex from '../../assets/images/imageindex'
import { JENNY_SCHEDULE } from '../../constants/Mockusers'
import { LinearGradient } from 'expo-linear-gradient'

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
  dateID: any;
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
}: UserDatesCardProps) => {
  return (
    <View
      style={{
        borderWidth: 0.8,
        borderColor: COLORS.DARKGREY,
        borderRadius: 8,
      }}
    >
      <View style={{ margin: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ marginRight: 10 }}>
            <Image source={{ uri: moviePoster }} style={styles.posterstyle} />
          </View>
          <View>
            <Text style={{ ...FONTS.Title2 }}>{movieName}</Text>
            <View style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ ...FONTS.Title2 }}>{movieYear}</Text>
              <Text style={{ ...FONTS.Title2, marginHorizontal: 10 }}>
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

              {JENNY_SCHEDULE[dateID].scheduleType.MIT && (
                <View style={{ marginHorizontal: 5 }}>
                  <Text style={styles.paragraphText2}>MIT</Text>
                </View>
              )}

              {JENNY_SCHEDULE[dateID].scheduleType.CRUView && (
                <View style={{ marginHorizontal: 5 }}>
                  <Text style={styles.paragraphText3}>CRU View</Text>
                </View>
              )}

              <Text style={styles.paragraphText}>scheduled for</Text>
              <View style={{ marginHorizontal: 5 }}>
                <Text style={styles.paragraphText2}>{scheduleDate}</Text>
              </View>

              <Text style={styles.paragraphText}>at</Text>

              {JENNY_SCHEDULE[dateID].scheduleType.MIT && (
                <View style={{ marginRight: 5 }}>
                  <Text style={styles.paragraphText2}>{scheduleTime}</Text>
                </View>
              )}

              {JENNY_SCHEDULE[dateID].scheduleType.CRUView && (
                <View style={{ marginRight: 5 }}>
                  <Text style={styles.paragraphText2}> {scheduleTime}</Text>
                </View>
              )}

              <Text style={styles.paragraphText}>to watch</Text>
              <View style={{ marginHorizontal: 5 }}>
                <Text style={styles.paragraphText}>"{movieName}"</Text>
              </View>

              <Text style={styles.paragraphText}>with</Text>

              {JENNY_SCHEDULE[dateID].scheduleType.MIT && (
                <View>
                  <Text style={styles.paragraphText2}>{scheduleWith}</Text>
                </View>
              )}

              {JENNY_SCHEDULE[dateID].scheduleType.CRUView && (
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

          {JENNY_SCHEDULE[dateID].scheduleType.MIT && (
            <TouchableOpacity>
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

          {JENNY_SCHEDULE[dateID].scheduleType.CRUView && (
            <TouchableOpacity>
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

const styles = StyleSheet.create({
  drawfonttag: {
    ...FONTS.Title2Orange,
    color: COLORS.DARKGREY,
    backgroundColor: COLORS.TAGCOLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderRadius: 4,
    textAlign: "center",
  },
  posterstyle: {
    width: 60,
    height: 90,
    borderRadius: 5,
  },
  paragraphText: {
    ...FONTS.Title2,
    color: COLORS.LIGHTGREY,
    fontSize: 12,
  },
  paragraphText2: {
    ...FONTS.Title2,
    color: COLORS.AKCRUBLUE,
    fontSize: 12,
  },
  paragraphText3: {
    ...FONTS.Title2,
    color: COLORS.MIDORANGE,
    fontSize: 12,
  },
});

