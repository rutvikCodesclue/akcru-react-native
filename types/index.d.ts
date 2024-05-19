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
    badge?: 'AKCRUIT' | 'GUARDIAN' | 'HERO' | 'SUPERHERO' | 'CELEBRITY';
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
    blocking?: IUserBlock[];
    blockedBy?: IUserBlock[];
    followers?: string[];
    following?: string[];
    wallet?: IWallet;
    watchlist?: IWatchlist[];
    watching?: IUserWatching;
    posts?: IPost[];
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
    sponsored: boolean;
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
            username: string;
        };
        members?: IUserProfile[];
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
        | 'UserCommentedOnPost'
        | 'UserLikedComment'
        | 'UserLikedPost'
        | 'UserTaggedOnPost'
        | 'UserTaggedOnComment'
        | 'ADReceived';
    userId: string;
    user?: IUserProfile;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
    message?: string;
    postId: number;
    senderId: string;
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
    badge?: 'AKCRUIT' | 'GUARDIAN' | 'HERO' | 'SUPERHERO';
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
    blocking?: IUserBlock[];
    blockedBy?: IUserBlock[];
    followers?: IUserProfile[];
    following?: IUserProfile[];
    wallet?: IWallet;
    watchlist?: IWatchlist[];
    promoUser: boolean;
    galleryLikes: IGalleryLike[];
    userGallery: IGallery[];
}

export interface IWatchlist {
    id: string;
    userId: string;
    movieId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    movie?: IMovie;
}

export interface IUserBlock {
    id: string;
    blockerId: string;
    blockedId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    blocker?: IUserProfile;
    blocked?: IUserProfile;
}

export interface IWallet {
    id: string;
    userId: string;
    balance: number;
    updatedAt: Date | string;
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
    sponsored: boolean;
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
        | 'ADReceived';
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
    content: string[];
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
    gifUrl?: string;
    createdAt: string;
    numberOfComments?: number;
    numberOfReposts?: number;
    numberOfLikes?: number;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL' | 'HYBRID';
    content: string[];
    authorId: string;
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
    gifUrl?: string;
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
    id: string;
    movieId: string;
    status: string;
    creatorId: string;
    creator: IUserProfile;
    invitee: IUserProfile;
    inviteeId: string;
    startDate: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
    lastMessage: string;
    lastMessageAt: string;
    movie: IChatMovie;
};

export type IChatMovie = {
    id: string;
    title: string;
    description: string;
    duration: number;
    year: number;
    movieURL?: string;
    trailerURL?: string;
    landscapeURL?: string;
    image?: string;
    price?: string;
    portraitURL?: string;
    rating: string;
};

export type ITicket = {
    id: string;
    createdAt: string;
    email: string;
    imageURL: string;
    description: string;
    type: 'BUG' | 'SUGGESTION' | 'QUESTION' | 'REPORT';
    reportedByUserId: string;
    reportedBy: string;
    reportedUserId: string;
    reported: string;
};

export interface IHelpVideo {
    id: string;
    title: string;
    description: string;
    videoURL: string;
    imageURL: string;
    createdAt: string;
    updatedAt: string;
    trinity: boolean;
}

export interface IGallery {
    id: string;
    imageURL: string;
    createdAt: string;
    updatedAt: string;
    userId: String;
    user: IUserProfiler;
    galleryLikes: IGalleryLike[];
    likesCount: number;
}

export interface IGalleryLike {
    id: string;
    user: IUserProfile;
    userId: string;
    gallery: IGallery;
    galleryId: string;
    dateCreated: string;
}
