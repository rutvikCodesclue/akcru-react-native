import {Alert} from 'react-native';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {IMovie} from '../../types';
import {navigateToTrailerPlayer} from '../util/RootNavigation';

let pendingThankYouMovie: IMovie | null = null;

export function setPpvThankYouPending(movie: IMovie): void {
    pendingThankYouMovie = movie;
}

export function consumePpvThankYouPending(): IMovie | null {
    if (!pendingThankYouMovie) {
        return null;
    }

    const movie = pendingThankYouMovie;
    pendingThankYouMovie = null;
    return movie;
}

export function startPpvMoviePlayback(
    movie: IMovie,
    navigation?: NavigationProp<ParamListBase>,
): boolean {
    const movieURL = movie.movieURL?.trim() ?? '';
    if (!movieURL) {
        Alert.alert('Playback unavailable', 'This title is not available to play right now.');
        return false;
    }

    navigateToTrailerPlayer(
        {
            id: movie.id,
            trailerURL: movieURL,
            landscapeURL: movie.landscapeURL,
            title: movie.title,
            playFullMovie: true,
            fromPpvFlow: true,
        },
        navigation,
    );
    return true;
}
