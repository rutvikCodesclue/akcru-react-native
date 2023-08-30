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
    profilePicture?: string;
}

export interface IMovie {
    id:           string;  
    title:        string;
    description:  string;
    genres:       string[];
    duration:     number;
    year:         number;
    movieURL:     string;
    trailerURL:   string;
    landscapeURL: string;
    image:        string;
    price:        number?;
    portraitURL:  string;
    rating:       number;
    rated:        string;
    actors:       Object[];
    director:     Object[];
    length:       number;
    published:    boolean;     
    createdAt:    string;
    updatedAt:    string;
}

export interface IGenreItem {
    id: Genre;
    genre: string;
    image: string;
    updatedAt: string;
    createdAt: string;
}

export interface ICru {
    id: string; 
    name: string;
    creatorId: string;
    creator: IUserProfile;
    members?:   IUserProfile[];
    cruViews:  ICruView[]
    Room:      Object?
}

export interface ICruView {
    id: string;
    cruId: string;
    cru:       {
        id: string;
        creatorId: string;
        creator: {
            firstName: string;
            lastName: string;
        }
    };
    movieId: string;
    movie:     IMovie
    startDate: string;
    timezone: string
}

export type ICruInvite = {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    cruId: string;
    inviteeId: string;
    cru: {
        id: string;
        creatorId: string;
        creator: {
            profilePicture?: string;
            firstName: string;
            lastName: string;
        }
    };
    createdAt: string;
    updatedAt?: string;
}