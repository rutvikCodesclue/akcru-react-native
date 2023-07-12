import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  Keyboard,
  Image
} from "react-native";

import { SearchBar } from "react-native-screens";

import React, { useRef, useState } from "react";
import {COLORS, SIZES, FONTS} from '../../../assets/constants';
import { Icon } from "@rneui/base";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./styles";
import LinearGradient from "react-native-linear-gradient";
import filter from "lodash/filter";
import { UserProfileStackParams } from "../../navigation/UserProfileStack";
import { Akcru_Content } from "../../../assets/constants/ListData";

interface Props {
  MovieDetailScreen: any;
}

const CruViewSearchInput = () => {
  //search input function
  const [data, setData] = useState([...Akcru_Content[0].movies]);
  const [modalVisible, setModalVisible] = useState(false);
  const [textInputFocused, setTextInputFocused] = useState(false);
  const textInputRef = useRef(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const contains = ({ name }: { name: string }, query: string) => {
    if (name.toLowerCase().includes(query.toLowerCase())) {
      return true;
    }
    return false;
  };

  const handleSearch = (text: any) => {
    const dataSearch = filter(Akcru_Content[0].movies, (userSearch) => {
      return contains(userSearch, text.toLowerCase());
    });

    setData([...dataSearch]);
  };

  return (
    <View>
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.AKCRUBACKGROUND, "transparent"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 65,
          width: SIZES.ScreenWidth,
        }}
      />
      <View style={{ alignItems: "center" }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <View style={styles.searchinput}>
            <Icon
              name="magnify"
              type="material-community"
              color={COLORS.DARKGREY}
              size={28}
              style={{ marginRight: 10 }}
            />
            <Text style={{ ...FONTS.Title2, color: COLORS.DARKGREY }}>
              Choose your movie
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <Modal animationType="fade" transparent={false} visible={modalVisible}>
          <View style={{ backgroundColor: COLORS.AKCRUBACKGROUND, flex: 1 }}>
            <View style={styles.searchmodal}>
              <View style={styles.searchinput}>
                <View>
                  <Icon
                    name={textInputFocused ? "arrow-left" : "magnify"}
                    onPress={() => {
                      if (textInputFocused) setModalVisible(false);
                      setTextInputFocused(true);
                    }}
                    iconStyle={{ marginRight: 5 }}
                    type="material-community"
                    style={styles.icon}
                    color={COLORS.DARKGREY}
                    size={28}
                  />
                </View>
                <TextInput
                  textAlignVertical={"center"}
                  placeholder="Search Movie"
                  placeholderTextColor={COLORS.DARKGREY}
                  style={styles.textinput}
                  autoFocus={false}
                  ref={textInputRef}
                  onFocus={() => {
                    setTextInputFocused(true);
                  }}
                  onBlur={() => {
                    setTextInputFocused(false);
                  }}
                  onChangeText={handleSearch}
                />
                <TouchableWithoutFeedback onPress={() => {}}>
                  <Icon
                    name="close-circle"
                    type="material-community"
                    size={25}
                    color={COLORS.DARKGREY}
                    style={{ marginLeft: 190 }}
                    onPress={() => {
                      textInputRef.current.clear();
                      handleSearch(textInputRef);
                      setTextInputFocused(true);
                    }}
                  />
                </TouchableWithoutFeedback>
              </View>
            </View>
            <View style={{ backgroundColor: COLORS.AKCRUBACKGROUND }}>
              <FlatList
                data={data}
                ListFooterComponent={<View style={{ marginBottom: 70 }} />}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss;
                      navigation.navigate("CruViewMovieDetailScreen", {
                        id: index,
                      });

                      setModalVisible(false);
                      setTextInputFocused(true);
                    }}
                  >
                    <View
                      style={{
                        marginHorizontal: 15,
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <Image
                          source={{ uri: item.portrait_poster }}
                          style={{ width: 30, height: 50, borderRadius: 3 }}
                        />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={{ ...FONTS.Title2, fontSize: 12 }}>
                            {item.name}
                          </Text>
                          <Text style={{ ...FONTS.paragraph1, fontSize: 12 }}>
                            {item.year}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

 

export default CruViewSearchInput;
