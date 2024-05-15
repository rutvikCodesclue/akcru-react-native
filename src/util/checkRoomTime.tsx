import moment from 'moment-timezone';

export const checkRoomTime = (movie_timezone: any, scheduleTime: any): boolean | void => {
    const currentTimeInMovieTimezone = moment.tz(movie_timezone);
    const initialTime = moment.tz(scheduleTime, movie_timezone);
    const room_time = initialTime.add(3, 'hours').add(30, 'minutes');

    const isAfterMovieDate = currentTimeInMovieTimezone.isAfter(room_time, 'day');
    if (isAfterMovieDate === true) {
        return true;
    } else {
        return false;
    }
};
