import {formatDistance, formatDuration, intervalToDuration} from 'date-fns';
import {AKCRUBADGES, COLORS} from '../../assets/constants';
import {DateTime} from 'luxon';

export function timeSince(dateCreated: string): string {
    const now = new Date();
    const postDate = new Date(dateCreated);
    return formatDistance(postDate, now) + ' ago';
}

export function capitalizeFirstLetterOfString2(str: string) {
    if (typeof str !== 'string') {
        console.error('Input is not a string:', str);
        return str;
    }

    if (str.length === 0) {
        return str;
    }

    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeFirstLetterOfString(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatMovieDuration(seconds: number) {
    const duration = intervalToDuration({start: 0, end: seconds * 1000});

    const formattedDuration = formatDuration(duration, {format: ['hours', 'minutes']});

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
    const parsedTimeString = time.toTimeString();
    const timeParts = parsedTimeString.split(' ')[0].split(':');
    if (!timeParts) {
        throw new Error('Invalid time format');
    }
    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

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

    return `${month}/${day}/${year}`;
}

export function formatTimestampToAMPM(timestamp: string | number | Date) {
    const date = new Date(timestamp);

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${minutes} ${ampm}`;
}

export function classifyPostContent(contentArray: string[]) {
    const imageUrls: string[] = [];
    let videoUrl = '';
    const textContentParts: string[] = [];

    contentArray.forEach(item => {
        if (/^https?:\/\/.+\.(jpeg|jpg|png|gif)$/i.test(item) && item.includes('user-pictures')) {
            imageUrls.push(item);
        } else if (/^https?:\/\/.+\.(mov|mp4)$/i.test(item) && item.includes('user-videos')) {
            videoUrl = item;
        } else {
            textContentParts.push(item);
        }
    });

    const textContent = textContentParts.join(' ');
    return {textContent, imageUrls, videoUrl};
}

export function extractUsernamesFromText(text: string) {
    const usernamePattern = /@[\w.]+(\S+)/g;
    let match;
    const usernames = [];

    while ((match = usernamePattern.exec(text)) !== null) {
        usernames.push(match[0].split('@')[1]);
    }
    return usernames;
}

export function formatNumber(num: number) {
    if (num < 10000) {
        return num.toString();
    }

    if (num < 1000000) {
        const thousands = num / 1000;
        if (Math.floor(thousands) !== thousands) {
            return thousands.toFixed(1) + 'k';
        }
        return Math.round(thousands) + 'k';
    }

    const millions = num / 1000000;
    if (Math.floor(millions * 100) / 100 !== millions) {
        return millions.toFixed(2) + 'm';
    }
    return Math.round(millions) + 'm';
}
