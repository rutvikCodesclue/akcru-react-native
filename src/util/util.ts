import {add, addMinutes, format, formatDistance, formatDuration, intervalToDuration, parse, parseISO, set, sub} from 'date-fns';
import {AKCRUBADGES, COLORS} from '../../assets/constants';
import {min} from 'lodash';
import {DateTime, IANAZone} from 'luxon';

export function timeSince(dateCreated: string): string {
    const now = new Date();
    const postDate = new Date(dateCreated);
    return formatDistance(postDate, now) + ' ago';
}

// export function capitalizeFirstLetterOfString(str: string) {
//     if (typeof str !== 'string') {
//         console.error('Input is not a string:', str);
//         return str; // or return a default value or throw an error, depending on your use case
//     }

//     if (str.length === 0) {
//         return str; // Return the original string if it's empty
//     }

//     return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }


export function capitalizeFirstLetterOfString(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatMovieDuration(seconds: number) {
    // Convert seconds to a duration object
    const duration = intervalToDuration({start: 0, end: seconds * 1000}); // Multiply by 1000 to convert to milliseconds
    // Convert the duration to a Date object

    // Format the duration into hours and minutes
    const formattedDuration = formatDuration(duration, {format: ['hours', 'minutes']});

    // replace hours and minutes with h and m
    const formattedDurationWithAbbreviations = formattedDuration
        .replace('0 hours', '')
        .replace('hours', 'h')
        .replace('hour', 'h')
        .replace('minutes', 'm');

    return formattedDurationWithAbbreviations;
}

export function selectAvatarBorderColor(akcruBadge: string) {
    if (akcruBadge === 'AKCRUIT') {
        return AKCRUBADGES.Akcruit.color;
    } else if (akcruBadge === 'GUARDIAN') {
        return AKCRUBADGES.Guardian.color;
    } else if (akcruBadge === 'HERO') {
        return AKCRUBADGES.Hero.color;
    } else if (akcruBadge === 'SUPERHERO') {
        return AKCRUBADGES.SuperHero.color;
    } else {
        return COLORS.AKCRUBLUE;
    }
}

export function combineDateAndTime(date: Date, time: Date, timezone: string): string | null {
    // Parse the time string to extract hours, minutes, seconds, and UTC offset
    const parsedTimeString = time.toTimeString();
    const timeParts = parsedTimeString.split(' ')[0].split(':');
    if (!timeParts) {
        throw new Error('Invalid time format');
    }
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    // Adjust the date's time using the extracted values and UTC offset
    var correctTime = DateTime.fromObject(
        {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: hours,
            minute: minutes,
            second: 0,
            millisecond: 0,
        },
        {zone: timezone},
    );

    if (correctTime.toISO()) {
        return correctTime.toISO();
    }

    return null;
}

export function getShortenedTimezone(timezone: string): string {
    // write a switch statement to return the shortened timezone
    switch (timezone) {
        case 'America/New_York':
            return 'EST';
        case 'America/Chicago':
            return 'CST';
        case 'America/Denver':
            return 'MST';
        case 'America/Los_Angeles':
            return 'PST';
        case 'Europe/London':
            return 'GMT';
        case 'Europe/Paris':
            return 'CET';
        case 'Asia/Tokyo':
            return 'JST';
        case 'Australia/Sydney':
            return 'AEDT';
        default:
            return timezone;
    }
}

  
export function formatDatestamp(timestamp: string | number | Date) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month}/${day}/${year}`;
}

export function formatTimestampToAMPM(timestamp: string | number | Date) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12; // Convert hours to 12-hour format

    return `${formattedHours}:${minutes} ${ampm}`;
}

