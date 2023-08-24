

export type ArchetypeMapping = {
    [key: string]: string;
};

export const archetypeMapping: ArchetypeMapping = {
    'Sci-Fi, Fantasy': 'Realm Voyager',
    'Sci-Fi, Drama': 'Whimsical Dreamer',
    'Sci-Fi, Mystery': 'Mystical Puzzler',
    'Sci-Fi, Thriller': 'Shadow Sleuth',
    'Sci-Fi, Comedy': 'Fantasy Fun-seeker',
    'Sci-Fi, Sports': 'Realm Athlete',
    'Sci-Fi, Family': 'Tribe Seeker',
    'Sci-Fi, Horror': 'Dark Explorer',
    'Sci-Fi, Action': 'Sorcery Warrior',
    'Sci-Fi, Crime': 'Fantasy Detective ',
    'Sci-Fi, Adventure': 'Adventurous Nior',
    'Sci-Fi, Romance': '',

    'Action, Adventure': 'Thrill Voyager',
    'Comedy, Romance': 'Romantic Comedian',
    // Define more mappings here...
};

const archetypeData = {archetypeMapping};

export default archetypeData;