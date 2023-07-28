interface IUserProfile {
    id: string;
    authId: string;
    email: string;
    username: string;
    dateOfBirth?: string;
    firstName?: string;
    lastName?: string;
    location?: string;
    description?: string;
    private?: boolean;
    followerCount?: number;
    MITCount?: number;
    adAmount?: number;
    badge?: 'AKCRUIT' | "GUARDIAN" | "HERO" | "SUPERHERO"; // FIXME: add remianing badges
    gallery?: string[];
    lastReview?: string;
    published?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface IMovie {
    id: number;
    name: string;
    url: string;
}