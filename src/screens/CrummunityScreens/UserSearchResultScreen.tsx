import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity, TextInput, FlatList } from 'react-native'
import React, {useState, useRef, useEffect} from 'react'
import { UserSearchCardList, Header, UserSearchCard } from '../../components'
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Icon } from '@rneui/base';
import { CrummunityStackParams } from "../../navigation/CrummunityStack";
import { FONTS, COLORS, SIZES } from '../../../constants';
import { FAKE_USER_PROFILES } from '../../../constants/Mockusers';
import filter from "lodash/filter";


const UserSearchResultScreen = () => {
  
const [data, setData] = useState([...FAKE_USER_PROFILES]);
const [modalVisible, setModalVisible] = useState(false);
const [textInputFocused, setTextInputFocused] = useState(false);
const textInputRef = useRef(null);
    const navigation =
      useNavigation<NativeStackNavigationProp<CrummunityStackParams>>();

  const contains = ({ userName }: { userName: string }, query: string) => {
    if (userName.includes(query)) {
      return true;
    }
    return false;
  };

  const handleSearch = (text: any) => {
    const dataSearch = filter(FAKE_USER_PROFILES, (userSearch) => {
      return contains(userSearch, text);
    });

    setData([...dataSearch]);
  };

  return (
    <View>
      <View>
        <Header />
      </View>
      <TouchableOpacity
        style={{ marginHorizontal: 15, marginBottom: 10 }}
        onPress={() => navigation.pop()}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon
            name="chevron-back"
            type="ionicon"
            size={20}
            color={COLORS.LIGHTGREY}
          />
          <Text style={{ ...FONTS.Title3, marginLeft: 5 }}>Back</Text>
        </View>
      </TouchableOpacity>
      <View style={{ alignItems: "center" }}>
        <View style={styles.searchinput}>
          <Icon
            name="magnify"
            type="material-community"
            color={COLORS.AKCRUBLUE}
            size={28}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search for user"
            placeholderTextColor={COLORS.DARKGREY}
            autoCorrect={false}      
            autoFocus={false}
            ref={textInputRef}
            onFocus={() => {
              setTextInputFocused(true);
            }}
            onBlur={() => {
              setTextInputFocused(false);
            }}
            onChangeText={handleSearch}
            style={{ color: COLORS.LIGHTGREY }}
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
      <View>
        <FlatList
          data={data}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={ item  => item.userID}
          renderItem={({ item, index }) => (
            <View style={{ margin: 5 }}>
              <UserSearchCard
                userPicture={item.userPicture}
                userName={item.userName}
                onPress={() =>
                  {navigation.navigate("ViewUserScreen", {
                    userID: index });
                    setTextInputFocused(true);
                  }}
                influencer={item.influencer}
                userID={item.userID}
                akcruBadge={item.akcruBadge}
              />
            </View>
          )}
        />
      </View>
    </View>
  );
}

export default UserSearchResultScreen

const styles = StyleSheet.create({
  searchinput: {
    width: SIZES.ScreenWidth / 1.08,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.DARKGREY,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: "center",
    height: 35,
  },
});