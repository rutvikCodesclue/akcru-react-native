import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableHighlight,
} from "react-native";

import { Icon } from "@rneui/base";
import { FONTS, COLORS } from "../../constants";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState, useCallback, useRef } from "react";
const MITMessageModal = () => {
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true);

  const snapPoints = ["70"];

  return (
    <View style={styles.container}>
      <BottomSheet ref={sheetRef} snapPoints={snapPoints}>
        <BottomSheetView>
        
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default MITMessageModal;

const styles = StyleSheet.create({
  container: {
    
    height: '100%',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
});
