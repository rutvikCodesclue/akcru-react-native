import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import { COLORS, FONTS } from "../../constants";
import { Icon } from "@rneui/base";
import { SIZES } from "../../constants";
import styles from "./Styles/styles";
import imageindex from "../../assets/images/imageindex";
import { LinearGradient } from "expo-linear-gradient";
import AkcruButtons from "./Buttons";

type MovieDetailScreenCardProps = {
  image_url: string;
  name: string;
  year: number;
  length: string;
  rated: string;
  rating: number;
  desc: string;
  actors: string;
  directors: string;
  id: string;
};


const MovieDetailScreenCard = ({
  image_url,
  id,
  name,
  year,
  length,
  rated,
  rating,
  desc,
  actors,
  directors,
}: MovieDetailScreenCardProps) => {
    
  return (
    <View>
      <View>
        <View>
          <Image
            source={{ uri: image_url }}
            style={{
              width: SIZES.ScreenWidth,
              height: SIZES.ScreenHeight / 1.5,
            }}
            resizeMode="cover"
          />
        </View>
        <View
          style={{
            height: 200,
            justifyContent: "flex-end",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <LinearGradient
            // Background Linear Gradient
            colors={["transparent", COLORS.AKCRUBACKGROUND]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 200,
            }}
          />
          <View style={{ marginBottom: 10, alignItems: "flex-end", marginRight: 5 }}>
            <View style={{ justifyContent: "center", flexDirection: "row", alignItems: 'center' }}>
              <Text style={{ ...FONTS.Title3, textAlign: "center", marginRight: 10 }}>
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
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
            }}
          >
            <AkcruButtons.MedButton
              btnname={"Watch Movie"}
              onPress={function (): void {}}
              color={COLORS.AKCRUBLUE}
            />
            <AkcruButtons.MedButton
              btnname={"Watch Trailer"}
              onPress={function (): void {}}
              color={COLORS.TAGCOLOR}
            />
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 15,
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <View style={{ width: 175 }}>
            <Text style={{ ...FONTS.Title3, fontSize: 20 }}>{name}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flexDirection: "row", marginLeft: 15 }}>
              <View style={{ marginRight: 25 }}>
                <TouchableOpacity>
                  <Icon
                    name="thumb-up-outline"
                    type="material-community"
                    color={"green"}
                    size={SIZES.MedIcon}
                  />
                </TouchableOpacity>
                <Text style={{ ...FONTS.Title2 }}>I Like</Text>
              </View>
              <View>
                <TouchableOpacity>
                  <Icon
                    name="thumb-down-outline"
                    type="material-community"
                    color={"red"}
                    size={SIZES.MedIcon}
                  />
                </TouchableOpacity>
                <Text style={{ ...FONTS.Title2 }}>Nah</Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            marginHorizontal: 15,
            flexDirection: "row",
            marginVertical: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignSelf: "center",
              marginRight: 20,
            }}
          >
            <Text
              style={{
                ...FONTS.Title2,
                color: COLORS.LIGHTGREY,
                marginRight: 10,
              }}
            >
              {year}
            </Text>
            <Text style={{ ...FONTS.Title2, color: COLORS.LIGHTGREY }}>
              {length}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Text style={styles.drawfonttag}>{rated}</Text>
            <Text style={styles.drawfonttag}>Drama</Text>
            <Text style={styles.drawfonttag}>Action</Text>
            <Text style={styles.drawfonttag}>{rating}/10</Text>
          </View>
        </View>
        <View style={{ marginHorizontal: 15, marginVertical: 10 }}>
          <TouchableOpacity>
            <View
              style={{
                borderColor: COLORS.AKCRUBLUE,
                borderWidth: 1,
                borderRadius: 5,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Image
                source={imageindex.MITticket}
                style={{ marginRight: 10 }}
              />

              <Text style={{ ...FONTS.Title2AkcruBlue }}>
                Send Movie Invite Ticket
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Image
            source={imageindex.AkcruHexLogo}
            style={{ width: 26, height: 26, marginRight: 10 }}
            resizeMode="contain"
          />
          <Text style={{ ...FONTS.Title2Orange }}>
            Earn up to 500 AKCRU dollars
          </Text>
        </View>
        <View style={{ marginHorizontal: 15, marginTop: 15 }}>
          <Text
            style={{
              ...FONTS.Title2Orange,
              color: COLORS.LIGHTGREY,
              lineHeight: 18,
              marginBottom: 10,
            }}
          >
            {desc}
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.DARKGREY,
                marginRight: 10,
              }}
            >
              Cast:
            </Text>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.AKCRUBLUE,
              }}
            >
              {actors}
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.DARKGREY,
                marginRight: 10,
              }}
            >
              Director:
            </Text>
            <Text
              style={{
                ...FONTS.Title2Orange,
                color: COLORS.AKCRUBLUE,
              }}
            >
              {directors}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MovieDetailScreenCard