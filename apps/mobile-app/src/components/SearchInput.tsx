import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  Keyboard
} from "react-native";

import { SearchBar } from "react-native-screens";

import React, {useRef, useState} from "react";
import { COLORS, FONTS, SIZES } from "../../constants";
import { Icon } from "@rneui/base";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./Styles/styles";
import { LinearGradient } from "expo-linear-gradient";
import { ClientStackParams } from "../navigation/ClientStack";
import { AuthStackParams } from "../navigation/AuthNavigation";
import { MOVIES } from "../../constants/Data";
import filter from 'lodash/filter';

import { MovieDetailScreen } from "../screens";

interface Props {
  MovieDetailScreen: any;
}


const SearchInput = () => {
//search input function
const [data, setData] = useState([...MOVIES]);
const [modalVisible, setModalVisible] = useState(false)
const [textInputFocused, setTextInputFocused] = useState(false);
const textInputRef = useRef(null);

const navigation =
  useNavigation<NativeStackNavigationProp<ClientStackParams>>();

   const contains = ({ name }: { name: string }, query: string) => {
     if (name.includes(query)) {
       return true;
     }
     return false;
   };

const handleSearch = (text: any) => {
  const dataSearch = filter(MOVIES, (userSearch) => {
    return contains(userSearch, text);
  });

  setData([...dataSearch]);
};


  
  return (
    <View>
      <LinearGradient
        // Background Linear Gradient
        colors={[COLORS.BLACK, "transparent"]}
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
              What movie are you searching for?
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <Modal animationType="fade" transparent={false} visible={modalVisible} >
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
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss;
                      navigation.navigate("MovieDetailScreen", { id: index });
                      setModalVisible(false);
                      setTextInputFocused(true);
                    }}
                  >
                    <View
                      style={{
                        marginHorizontal: 15,
                        backgroundColor: COLORS.AKCRUBACKGROUND,
                      }}
                    >
                      <Text style={{ ...FONTS.Title2 }}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={ item  => item.id}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default SearchInput;