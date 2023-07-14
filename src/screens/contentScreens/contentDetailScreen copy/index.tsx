import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React from 'react';
import styles from './styles';

import Header from '../../../components/header';
import AkcruReviewCard from '../../../components/AkcruReviewCard';
import AkcruButtons from '../../../components/akcruButtons';
import MovieDetailCard from '../../../components/MovieDetailCard';
import BasicListCategories from '../../../components/BasicListCategories';
import { FONTS, COLORS, SIZES } from '../../../../assets/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {ClientStackParams} from '../../../navigation/ClientStack';
import { FAKE_USER_PROFILES } from '../../../../assets/constants/Mockusers';
import {Icon} from '@rneui/base';
import { Akcru_Content } from '../../../../assets/constants/ListData';

type ContentDetailScreenNavigationProp = StackNavigationProp<
  ClientStackParams,
  'ContentDetailScreen'
>;

type ContentDetailScreenRouteProp = RouteProp<
  ClientStackParams,
  'ContentDetailScreen'
>;

type Props = {
  navigation: ContentDetailScreenNavigationProp;
  route: ContentDetailScreenRouteProp;
};

const RecommendedForYou = Akcru_Content[4];

export default function ContentDetailScreenCopy({navigation, route}: Props) {
  const id: string | undefined = route.params?.id ?? null;
  const movies: string | undefined = route.params?.movies ?? null;

  const {
    name,
    desc,
    actors,
    directors,
    genre,
    portrait_poster,
    landscape_poster,
    rating,
    year,
    rated,
    length,
    movie_url,
    youtubetrailer,
  } = Akcru_Content[0].movies[id ?? 0];

  return (
    <SafeAreaView>
      <ScrollView stickyHeaderIndices={[0]}>
        <View>
          <Header />
        </View>

        <View style={{marginTop: -65, marginBottom: 10}}>
          <MovieDetailCard
            portrait_poster={portrait_poster}
            name={name}
            year={year}
            length={length}
            rated={rated}
            rating={rating}
            desc={desc}
            actors={actors.join(', ')}
            directors={directors.join(', ')}
            id={''}
            youtubetrailer={youtubetrailer}
            landscape_poster={landscape_poster}
            movie_url={movie_url}
            genre1={genre[0]}
            genre2={genre[1]}
            onPress={() => {
              navigation.navigate('MITDateSchedule', {
                id: id,
                movie: name,
              });
            }}
          />
        </View>
        <View style={{marginHorizontal: 15}}>
          <BasicListCategories Akcru_Content={RecommendedForYou} />
        </View>
        <View style={{marginHorizontal: 15}}>
          <Text style={{...FONTS.Title2, marginVertical: 10}}>
            Akcru Review
          </Text>
          <View style={{marginBottom: 75}}>
            <View>
              {FAKE_USER_PROFILES.map(item => (
                <View key={item.userID} style={{marginBottom: 10}}>
                  <AkcruReviewCard
                    userPicture={item.userPicture}
                    userName={item.userName}
                    movieReview={item.movieReview}
                    movieReviewDate={item.movieReviewDate}
                    userID={item.userID}
                  />
                </View>
              ))}
            </View>
            <View style={styles.input}>
              <TextInput
                placeholder={'placeholder'}
                placeholderTextColor={'transparent'}
                style={styles.textinput}
              />
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <AkcruButtons.XSmallButton
                btnname={'POST'}
                onPress={function (): void {}}
                color=""
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
