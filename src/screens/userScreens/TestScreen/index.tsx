
import {Text, View, StyleSheet, Image, Platform} from 'react-native';
import React from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AkcruButtons from '../../../components/akcruButtons';
import {FAB, Portal, Provider} from 'react-native-paper';
import { COLORS } from '../../../../assets/constants';

const TestScreen = () => {
  const [state, setState] = React.useState({open: false});

  const onStateChange = ({open}) => setState({open});

  const [response, setResponse] = React.useState<any>(null);

  const {open} = state;
  return (
    <View style={{flex: 1, alignContent: 'flex-start'}}>
      {response?.assets &&
        response?.assets.map(({uri}) => (
          <View key={uri} style={styles.image}>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={{width: 200, height: 200}}
              source={{uri: uri}}
            />
          </View>
        ))}
        <View style={{flex: 1, paddingBottom: 100}}>
          <Provider>
        <Portal >
          <FAB.Group
            fabStyle={styles.fab}
            open={open}
            icon={open ? 'minus' : 'plus'}
            actions={[
              {
                icon: 'camera',
                small: false,
                onPress: () => {
                  launchCamera(
                    {
                      saveToPhotos: true,
                      mediaType: 'photo',
                      includeBase64: false,
                    },
                    setResponse,
                  );
                },
              },
              {
                icon: 'image-area',
                small: false,
                onPress: () => {
                  launchImageLibrary(
                    {
                      selectionLimit: 0,
                      mediaType: 'photo',
                      includeBase64: false,
                    },
                    setResponse,
                  );
                },
              },
            ]}
            onStateChange={onStateChange}
            onPress={() => {
              if (open) {
                // do something if the speed dial is open
              }
            }}
          />
        </Portal>
      </Provider>
        </View>
      
    </View>
  );
}

export default TestScreen;

const styles = StyleSheet.create({
  fab: {
    backgroundColor: COLORS.AKCRUBLUE,
  },
  image: {
    marginVertical: 24,
    alignItems: 'center',
  },
});
