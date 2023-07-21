import * as React from 'react';
import {
  Animated,
  Dimensions,
  Text,
  View,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
// import data from "./data";
import { Akcru_Content } from '../../../../assets/constants/ListData';
import {COLORS, FONTS, SIZES} from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {ClientStackParams} from '../../../navigation/ClientStack';
import imageindex from '../../../../assets/images/imageindex';
import Header from '../../../components/header';
import { NoBottomTabStackParams } from '../../../navigation/NoBottomTabStack';

const data = Akcru_Content[7].movies;

const {width, height} = Dimensions.get('window');
const TICKER_HEIGHT = 20;
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = 40;
const CIRCLE_SIZE = width * 0.6;
const DOT_SIZE = 15;

type ContentSwipeNavigationProp = StackNavigationProp<
  ClientStackParams,
  'ContentSwipe'
>;

type ContentSwipeRouteProp = RouteProp<NoBottomTabStackParams, 'ContentSwipe'>;

type Props = {
  navigation: ContentSwipeNavigationProp;
  route: ContentSwipeRouteProp;
  portrait_poster: string;
  genre: string;
  rated: string;
  rating: number;
  desc: string;
  length: string;
  onPress: () => void;
  onPress2: () => void;
  index: any;
  scrollX: any;
};

const Item = ({
  portrait_poster,
  genre,
  rated,
  rating,
  desc,
  length,
  scrollX,
  index,
  onPress,
  navigation,
  route,
}: Props) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const opacityInputRange = [
    (index - 0.4) * width,
    index * width,
    (index + 0.4) * width,
  ];
  const translateXHeading = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.1, 0, -width * 0.1],
  });
  const translateXDescription = scrollX.interpolate({
    inputRange,
    outputRange: [width, 0, -width],
  });
  const opacity = scrollX.interpolate({
    inputRange: opacityInputRange,
    outputRange: [0, 1, 0],
  });
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.1, 0.5, 0.1],
  });
  return (
    <TouchableOpacity style={styles.itemStyle} onPress={onPress}>
      <Animated.Image
        source={{uri: portrait_poster}}
        style={[
          styles.imageStyle,
          {
            transform: [{scale: imageScale}],
          },
        ]}
      />

      <View style={styles.textContainer}>
        <View style={{flexDirection: 'row'}}>
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity,
                transform: [{translateX: translateXHeading}],
              },
            ]}>
            {rated}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity,
                transform: [{translateX: translateXHeading}],
              },
            ]}>
            {genre[0]}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity,
                transform: [{translateX: translateXHeading}],
              },
            ]}>
            {genre[1]}
          </Animated.Text>
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity,
                transform: [{translateX: translateXHeading}],
              },
            ]}>
            {rating}/10
          </Animated.Text>
        </View>

        {/* <Animated.Text
          style={[
            styles.description,
            {
              opacity,
              transform: [{ translateX: translateXDescription }],
            },
          ]}
        >
          {desc}
        </Animated.Text> */}
      </View>
    </TouchableOpacity>
  );
};

const Circle = ({scrollX}) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.circleContainer]}>
      {data.map((item, index) => {
        const inputRange = [
          (index - 0.55) * width,
          index * width,
          (index + 0.55) * width,
        ];
        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                backgroundColor: COLORS.AKCRUBACKGROUND,
                opacity: scrollX.interpolate({
                  inputRange,
                  outputRange: [0, 0.1, 0],
                }),
                transform: [
                  {
                    scale: scrollX.interpolate({
                      inputRange,
                      outputRange: [0, 1, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const Ticker = ({scrollX}) => {
  return (
    <View style={styles.tickerContainer}>
      <Animated.View
        style={{
          transform: [
            {
              translateY: scrollX.interpolate({
                inputRange: [-width * 2, -width, 0, width, width * 2],
                outputRange: [
                  TICKER_HEIGHT * 2,
                  TICKER_HEIGHT,
                  0,
                  -TICKER_HEIGHT,
                  -TICKER_HEIGHT * 2,
                ],
              }),
            },
          ],
        }}>
        {data.map(({name, year, length}, index) => {
          return (
            <View key={index.toString()} style={{flexDirection: 'row'}}>
              <Text key={index} style={styles.tickername}>
                {name}
              </Text>
              <Text style={{...FONTS.paragraph1, marginLeft: 10}}>{year}</Text>
              <Text style={{...FONTS.paragraph1, marginLeft: 10}}>
                {length}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const Pagination = ({scrollX, onPress2}) => {
  const translateX = scrollX.interpolate({
    inputRange: data.map((_, i) => i * width),
    outputRange: data.map((_, i) => i * 15),
  });

  return (
    <View style={styles.paginationview}>
      <View style={styles.pagination}>
        <Animated.View
          style={[
            styles.paginationIndicator,
            {
              transform: [{translateX}],
            },
          ]}
        />
        {data.map(item => {
          return (
            <View key={item.id} style={styles.paginationDotContainer}>
              <View
                style={[
                  styles.paginationDot,
                  {backgroundColor: COLORS.TRANSLIGHTGREY},
                ]}
              />
            </View>
          );
        })}
      </View>
      <Pressable onPress={onPress2}>
        <Text style={{...FONTS.Title2Orange, marginTop: 10}}>
          Skip to Homepage
        </Text>
      </Pressable>
    </View>
  );
};

export default function ContentSwipe({navigation, route}: Props) {
  const _scrollX = React.useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Header />
      </View>
      <View
        style={{
          position: 'absolute',
          width: SIZES.ScreenWidth,
          bottom: SIZES.ScreenHeight / 1.3,
        }}>
        <Text
          style={{
            ...FONTS.Title2,
            textAlign: 'center',
            width: SIZES.ScreenWidth / 1.2,
            alignSelf: 'center',
            marginBottom: 10,
          }}>
          Watch any of our top 5 movies today and earn 2x the Akcru Dollars
        </Text>
        <Image
          source={imageindex.AkcruHexLogo}
          style={{width: 26, height: 26, alignSelf: 'center'}}
        />
      </View>
      <Circle scrollX={_scrollX} />
      {/* <Image
        style={styles.logo}
        source={require("./assets/ue_black_logo.png")}
      /> */}
      <Animated.FlatList
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        horizontal
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: _scrollX}}}],
          {useNativeDriver: true},
        )}
        data={data}
        renderItem={({item, index}) => (
          <Item
            {...item}
            index={index}
            scrollX={_scrollX}
            onPress={() => {
              console.log('id:', item.id);
              console.log('movie:', item.name);
              navigation.navigate('ContentDetailScreen', {
                id: item.id,
                movie: item.id,
              });
            }}
          />
        )}
      />
      <Pagination
        scrollX={_scrollX}
        onPress2={() => navigation.navigate('ClientTabNavigator')}
      />
      <Ticker scrollX={_scrollX} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },

  itemStyle: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.ScreenHeight / 8,
  },
  imageStyle: {
    width: width * 1.1,
    height: width * 0.75,
    resizeMode: 'cover',
    flex: 1,
    borderRadius: 10,
    marginTop: -50,
  },
  textContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 0.55,
    marginTop: -135,
  },
  heading: {
    ...FONTS.Title2Orange,
    color: COLORS.BLACK,
    backgroundColor: COLORS.STARGOLD,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
    borderRadius: 4,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: '#ccc',
    fontWeight: '600',
    textAlign: 'center',
    width: width * 0.75,

    fontSize: 16,
    lineHeight: 16 * 1.5,
  },

  circleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: 'absolute',
    top: '50%',
  },
  tickername: {
    textTransform: 'uppercase',
    fontSize: TICKER_HEIGHT,
    lineHeight: TICKER_HEIGHT,
    fontWeight: '800',
    color: COLORS.LIGHTGREY,
  },
  tickerContainer: {
    height: TICKER_HEIGHT,
    overflow: 'hidden',
    position: 'absolute',
    top: SIZES.ScreenHeight / 4.4,
    left: 20,
  },
  paginationview: {
    position: 'absolute',
    right: 50,
    left: 50,
    bottom: SIZES.ScreenHeight / 5.5,
    alignItems: 'center',
  },

  pagination: {
    flexDirection: 'row',
    height: DOT_SIZE,
  },
  paginationDot: {
    width: DOT_SIZE * 0.3,
    height: DOT_SIZE * 0.3,
    borderRadius: DOT_SIZE * 0.15,
  },
  paginationDotContainer: {
    width: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationIndicator: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.MIDORANGE,
    // position: 'absolute',
  },
  logo: {
    opacity: 0.9,
    height: LOGO_HEIGHT,
    width: LOGO_WIDTH,
    resizeMode: 'contain',
    position: 'absolute',
    left: 10,
    bottom: 10,
    transform: [
      {translateX: -LOGO_WIDTH / 2},
      {translateY: -LOGO_HEIGHT / 2},
      {rotateZ: '-90deg'},
      {translateX: LOGO_WIDTH / 2},
      {translateY: LOGO_HEIGHT / 2},
    ],
  },
  header: {
    position: 'absolute',
  },
});
