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
    badge?: 'AKCRUIT' | 'GUARDIAN' | 'HERO' | 'SUPERHERO' | 'CELEBRITY'; // FIXME: add remianing badges
    gallery?: string[];
    lastReview?: string;
    published?: boolean;
    createdAt?: string;
    updatedAt?: string;
    profilePicture?: string;
    phoneNumber?: string;
    password?: string;
    archetype?: string;
    Cru?: ICru;
    influencerStatus: boolean;
    ownerStatus: boolean;
    companyStatus: boolean;
    blocking?: IUserBlock[]; // This assumes you have an IUserBlock interface defined
    blockedBy?: IUserBlock[]; // Same as above
    followers?: string[]; // This is a recursive relation, assuming followers are also of type IUserProfile
    following?: string[]; // Same as above
    wallet?: IWallet; // This assumes you have an IWallet interface defined
    watchlist?: IWatchlist[]; // Array of watchlist items
    watching?: IUserWatching; // Array of movies being watched
    posts?: IPost[]; // Array of posts created by the user
}

interface IUserWatching {
    id: string;
    user: IUserProfile;
    userId: string;
    movieId: string;
    movie: IMovie;
    startedAt: string;
    finishedAt: string;
}

export interface IMovie {
    id: string;
    title: string;
    description: string;
    genres: string[];
    duration: number;
    year: number;
    movieURL: string;
    trailerURL: string;
    landscapeURL: string;
    image: string;
    price: number?;
    portraitURL: string;
    rating: number;
    rated: string;
    actors: Object[];
    director: Object[];
    length: number;
    published: boolean;
    createdAt: string;
    updatedAt: string;
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
    members?: IUserProfile[];
    cruViews: ICruView[];
    Room: Object?;
}

export interface ICruView {
    id: string;
    cruId: string;
    cru: {
        id: string;
        creatorId: string;
        creator: {
            firstName: string;
            lastName: string;
        };
    };
    movieId: string;
    movie: IMovie;
    startDate: string;
    timezone: string;
}

export type ICruInvite = {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    cruId: string;
    inviteeId: string;
    cru: {
        id: string;
        creatorId: string;
        creator: {
            profilePicture?: string;
            firstName: string;
            lastName: string;
            username: string;
        };
    };
    createdAt: string;
    updatedAt?: string;
};

export type IMITInvite = {
    id: string;
    movieId: string;
    movie: IMovie;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    creatorId: string;
    creator: IUserProfile;
    inviteeId: string;
    invitee: IUserProfile;
    startDate: string;
    timezone: string;
    createdAt: string;
    updatedAt?: string;
};

export type INotification = {
    id: string;
    type:
        | 'MITReceived'
        | 'MITAccepted'
        | 'MITDeclined'
        | 'CruInviteReceived'
        | 'CruInviteAccepted'
        | 'CruInviteDeclined'
        | 'CruViewScheduled'
        | 'CruViewStarted'
        | 'UserFollowed'
        | 'UserCommentedOnPost';
    userId: string;
    user?: IUserProfile;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
    message?: string;
};
export interface IUserProfile {
    message: string?;
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
    badge?: 'AKCRUIT' | 'GUARDIAN' | 'HERO' | 'SUPERHERO'; // FIXME: add remianing badges
    gallery?: string[];
    lastReview?: string;
    published?: boolean;
    createdAt?: string;
    updatedAt?: string;
    profilePicture?: string;
    phoneNumber?: string;
    password?: string;
    archetype?: string;
    Cru?: ICru;
    influencerStatus: boolean;
    ownerStatus: boolean;
    companyStatus: boolean;
    blocking?: IUserBlock[]; // This assumes you have an IUserBlock interface defined
    blockedBy?: IUserBlock[]; // Same as above
    followers?: IUserProfile[]; // This is a recursive relation, assuming followers are also of type IUserProfile
    following?: IUserProfile[]; // Same as above
    wallet?: IWallet; // This assumes you have an IWallet interface defined
    watchlist?: IWatchlist[]; // Array of watchlist items
}

export interface IWatchlist {
    id: string; // Unique identifier for the watchlist record
    userId: string; // ID of the user who owns the watchlist
    movieId: string; // ID of the movie added to the watchlist
    createdAt: Date | string; // Date when the movie was added to the watchlist, use Date for actual Date objects, string if dates are kept in ISO format
    updatedAt: Date | string; // Date when the watchlist record was last updated, use Date for actual Date objects, string if dates are kept in ISO format
    movie?: IMovie;
}


export interface IUserBlock {
    id: string; // Unique identifier for the block record
    blockerId: string; // ID of the user who initiated the block
    blockedId: string; // ID of the user who is being blocked
    createdAt: Date | string; // Date when the block was created, use Date for actual Date objects, string if dates are kept in ISO format
    updatedAt: Date | string; // Date when the block record was last updated, use Date for actual Date objects, string if dates are kept in ISO format
    blocker?: IUserProfile;
    blocked?: IUserProfile;
}

export interface IWallet {
    id: string; // Unique identifier for the wallet
    userId: string; // ID of the user who owns the wallet
    balance: number; // The current balance in the wallet
    updatedAt: Date | string; // Date when the wallet was last updated, use Date for actual Date objects, string if dates are kept in ISO format
    user?: IUserProfile;
}

export interface IMovie {
    id: string;
    title: string;
    description: string;
    genres: string[];
    duration: number;
    year: number;
    movieURL: string;
    trailerURL: string;
    landscapeURL: string;
    image: string;
    price: number?;
    portraitURL: string;
    rating: number;
    rated: string;
    actors: Object[];
    director: Object[];
    length: number;
    published: boolean;
    createdAt: string;
    updatedAt: string;
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
    members?: IUserProfile[];
    cruViews: ICruView[];
    Room: Object?;
}

export interface ICruView {
    id: string;
    cruId: string;
    cru: {
        id: string;
        creatorId: string;
        creator: {
            firstName: string;
            lastName: string;
        };
    };
    movieId: string;
    movie: IMovie;
    startDate: string;
    timezone: string;
}

export type ICruInvite = {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    cruId: string;
    inviteeId: string;
    cru: {
        id: string;
        creatorId: string;
        creator: {
            profilePicture?: string;
            firstName: string;
            lastName: string;
            username: string;
        };
    };
    createdAt: string;
    updatedAt?: string;
};

export type IMITInvite = {
    id: string;
    movieId: string;
    movie: IMovie;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    creatorId: string;
    creator: IUserProfile;
    inviteeId: string;
    invitee: IUserProfile;
    startDate: string;
    timezone: string;
    createdAt: string;
    updatedAt?: string;
};

export type INotification = {
    id: string;
    type:
        | 'MITReceived'
        | 'MITAccepted'
        | 'MITDeclined'
        | 'CruInviteReceived'
        | 'CruInviteAccepted'
        | 'CruInviteDeclined'
        | 'CruViewScheduled'
        | 'CruViewStarted'
        | 'UserFollowed';
    userId: string;
    user?: IUserProfile;
    isRead: boolean;
    message: string?;
    createdAt: string;
    updatedAt?: string;
};

export interface IPost {
    id: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL' | 'HYBRID';
    content: string[]; // Array of content, could be text, image URLs, video URLs etc.
    createdAt: string;
    updatedAt: string;
    author: IUserProfile;
    authorId: string;
    likes?: ILike[];
    comments?: IComment[];
    _count?: {
        likes: number;
        comments: number;
    };
    isLikedByCurrentUser?: boolean;
}


export interface ICreatePostData {
    id: string;
    user?: IUserProfile;
    title: string;
    content: string;
    gifUrl?: string; // Add gifUrl as an optional property
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    numberOfLikes?: number;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL' | 'HYBRID';
    content: string[]; // Array of strings representing content
    authorId: string; // ID of the author creating the post
}

export interface IComment {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    likes?: number;
    author: string;
    authorId: string;
    _count: {
        likes: number;
        comments: number;
    };
    isLikedByCurrentUser: boolean;
    // Other properties related to a post
}

export interface ICommentLike {
    id: string;
    userId: string;
    commentId: string;
    user: IUserProfile;
    comment: IComment;
}

export interface ICreateCommentData {
    id: string;
    user?: IUserProfile;
    title: string;
    content: string;
    gifUrl?: string; // Add gifUrl as an optional property
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    numberOfLikes?: number;
    text: string;
    postId: string;
    authorId: string;
}

export type SkinnyType = {
    id: string;
    content: string;
    user: IUserProfile;
    createdAt: string;
    image?: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    numberOfLikes?: number;
};




export type IChatType = {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    updatedAt: string;
    chatRoomId: string;
    
};

export type IChatUser = {
    id:string,
    movieId:string,
    status:string,
    creatorId:string,
    inviteeId:string,
    startDate:string,
    timezone:string,
    createdAt:string,
    updatedAt:string,
    lastMessage:string,
    lastMessageAt:string,
    movie: IChatMovie

}

export type IChatMovie ={
    id:string,
    title:string,
    description:string,
    duration:number,
    year: number,
    movieURL?:string,
    trailerURL?:string,
    landscapeURL?:string,
    image?:string,
    price?:string,
    portraitURL?:string
    rating:string
}