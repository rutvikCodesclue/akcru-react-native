import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import styles from "./styles";
import { View, Alert, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Button } from "react-native";
import { Session } from "@supabase/supabase-js";
import AkcruButtons from "../../../components/akcruButtons";
import Header from "../../../components/header";
import {COLORS, SIZES, FONTS} from '../../../../assets/constants';
import { FAKE_USER_PROFILES } from "../../../../assets/constants/Mockusers";
import { Icon, Avatar } from "@rneui/base";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { UserProfileStackParams } from "../../../navigation/UserProfileStack";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
// import * as ImagePicker from "expo-image-picker";

const gallery = FAKE_USER_PROFILES[0].gallery

export default function EditAccount({ session }: { session: Session }) {

  const navigation =
    useNavigation<NativeStackNavigationProp<UserProfileStackParams>>();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [desc, setDesc] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gallery, setGallery] = useState(FAKE_USER_PROFILES[0].gallery);

  console.log(
    "Attempting to Signup w/ Email/Password userName:", userName
  );
  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`userName, desc, avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUserName(data.userName);
        setDesc(data.desc);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function UpdateProfile({
    userName,
    desc,
    avatar_url,
  }: {
    userName: string;
    desc: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        userName,
        desc,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // const deleteImage = (index) => {
  //   const updatedGallery = [...gallery];
  //   updatedGallery.splice(index, 1);
  //   setGallery(updatedGallery);
  // };

  const sheetRef = useRef<BottomSheet>(null); //Pop up trailer
  const [isOpen, setIsOpen] = useState(false);

  const snapPoints = ["1", "75"];

  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  const [image, setImage] = useState(null);

  // const pickImage = async () => {
  //   // No permissions request is necessary for launching the image library
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   console.log(result);

  //   if (!result.canceled) {
  //     setImage(result.assets[0].uri);
  //   }
  // };

  return (
    <SafeAreaView>
      <ScrollView stickyHeaderIndices={[0]}>
        <View style={{ zIndex: 20 }}>
          <Header />
        </View>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.pop()}>
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
          <View>
            <Text style={styles.title}>EDIT PROFILE</Text>
            <View style={{ alignItems: "center" }}>
              <Avatar
                rounded
                size={100}
                source={{
                  uri: FAKE_USER_PROFILES[0].userPicture,
                }}
                avatarStyle={{
                  borderWidth: 2,
                  borderColor: FAKE_USER_PROFILES[0].avatarbordercolor,
                }}
              />
              <TouchableOpacity>
                <Text
                  style={{
                    ...FONTS.Title2AkcruBlue,
                    marginTop: 10,
                    color: COLORS.MIDORANGE,
                  }}
                >
                  Edit profile photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.gallerycontainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryImagesContainer}
              bounces={false}
            >
              {gallery.map((imageUri, index) => {
                return (
                  <View style={{ flexDirection: "row" }}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.galleryImage}
                    />
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        right: 15,
                        top: 0,
                        zIndex: 20,
                      }}
                      // onPress={() => deleteImage(index)}
                    >
                      <Icon
                        name="close-circle"
                        type="ionicon"
                        color={COLORS.CATREDLGT}
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => handleSnapPress(1)}>
              <Text
                style={{
                  ...FONTS.Title2AkcruBlue,
                  marginTop: 15,
                  textAlign: "center",
                  color: COLORS.MIDORANGE,
                }}
              >
                Upload to gallery
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.inputlabel}>Username</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={FAKE_USER_PROFILES[0].userName}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                onChangeText={(text) => setUserName(text)}
                value={userName || ""}
              />
            </View>
          </View>

          <View>
            <Text style={styles.inputlabel}>Description</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={FAKE_USER_PROFILES[0].userDesc}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                onChangeText={(text) => setDesc(text)}
                value={desc || ""}
              />
            </View>
          </View>

          <View>
            <Text style={styles.inputlabel}>Email</Text>
            <View style={styles.input}>
              <TextInput
                placeholder={FAKE_USER_PROFILES[0].email}
                placeholderTextColor={COLORS.DARKGREY}
                style={styles.textinput}
                secureTextEntry={false}
                value={session?.user?.email}
              />
            </View>
          </View>

          {/* <View>
            <Input
              label="Username"
              value={userName || ""}
              onChangeText={(text) => setUserName(text)}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input label="Email" value={session?.user?.email} disabled />
          </View>

          <View style={styles.verticallySpaced}>
            <Input
              label="Description"
              value={desc || ""}
              onChangeText={(text) => setDesc(text)}
            />
          </View> */}

          <View style={{ alignItems: "center", marginTop: 20 }}>
            <AkcruButtons.LrgButton
              btnname={loading ? "Loading ..." : "Update"}
              disabled={loading}
              color={COLORS.AKCRUBLUE}
              onPress={() =>
                UpdateProfile({ userName, desc, avatar_url: avatarUrl })
              }
            />
          </View>

          {/* <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title={loading ? "Loading ..." : "Update"}
              onPress={() =>
                UpdateProfile({ userName, desc, avatar_url: avatarUrl })
              }
              disabled={loading}
            />
          </View> */}
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <TouchableOpacity>
              <Text style={styles.settingslabel}>Account Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => supabase.auth.signOut()}>
              <Text style={[styles.settingslabel, styles.mt20]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.verticallySpaced}>
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
          </View> */}
        </View>
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: COLORS.AKCRUBACKGROUND }}
          onClose={() => setIsOpen(true)}
        >
          <BottomSheetScrollView style={{ marginHorizontal: 15 }}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                title="Pick an image from camera roll"
                // onPress={pickImage}
              />
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{ width: 200, height: 200 }}
                />
              )}
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}

