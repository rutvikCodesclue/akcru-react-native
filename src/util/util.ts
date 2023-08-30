import { format, formatDuration, intervalToDuration } from "date-fns";
import { AKCRUBADGES, COLORS } from "../../assets/constants";

export function capitalizeFirstLetterOfString(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatMovieDuration(seconds: number) {
    // Convert seconds to a duration object
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 }); // Multiply by 1000 to convert to milliseconds
    // Convert the duration to a Date object

    // Format the duration into hours and minutes
    const formattedDuration = formatDuration(duration, { format: ["hours", "minutes"]});

    // replace hours and minutes with h and m
    const formattedDurationWithAbbreviations = formattedDuration.replace("0 hours", "").replace("hours", "h").replace("hour", "h").replace("minutes", "m");

    return formattedDurationWithAbbreviations;
}

export function selectAvatarBorderColor(akcruBadge: string) {
    if (akcruBadge === "AKCRUIT") {
      return AKCRUBADGES.Akcruit.color
    } else if (akcruBadge === "GUARDIAN") {
      return AKCRUBADGES.Guardian.color
    } else if (akcruBadge === "HERO") {
      return AKCRUBADGES.Hero.color
    } else if (akcruBadge === "SUPERHERO") {
      return AKCRUBADGES.SuperHero.color
    } else {
      return COLORS.AKCRUBLUE
    }
  }