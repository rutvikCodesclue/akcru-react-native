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
    blackCloakStatus?: boolean;
    seriesReactions?: IUserSeriesReaction[];
    episodeReactions?: IUserEpisodeReaction[];
    polls?: IPoll[];
    votes?: IVote[];
    pollCreator: boolean;
    pollComments: IPollComment[];
    pollCommentLikes: IPollCommentLike[];
    pollLikes: IPollLike[];
    isAdmin: boolean;
    isArchetypeMatch: boolean;
    matchLabel: string;
    canGrantAD: boolean;
    hasSetFlirtPref: boolean;
    ADTransaction: IADTransaction[];
    AdPurchase: IAdPurchase[];
    MoviePurchase: IMoviePurchase[];
    visionaryStatus: boolean;
    SeasonPurchase: ISeasonPurchase[];
    visionaryStatus: boolean;
    hasVideoPrivileges: boolean;
}

export type IGender = 'MALE' | 'FEMALE' | 'NONBINARY';

export type IAgeBracket = 'AGE_18_24' | 'AGE_25_34' | 'AGE_35_39' | 'AGE_40_49' | 'AGE_50_PLUS';
interface IUserWatching {
    id: string;
    user: IUserProfile;
    userId: string;
    movieId: string;
    movie: IMovie;
    startedAt: string;
    finishedAt: string;
}

export interface IFlirtPreference {
    id: string;
    userId: string;
    gender: IGender[];
    ageBrackets: IAgeBracket[];
    relationIntent: string;
    archetypes: string[];
    createdAt: string;
    updatedAt: string;
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
    flickFlirt: boolean;
    shortFilm: boolean;
    rentalDurationHrs?: number | null;
    totalADEarned: string; // BigInt serialized as string
    rentable: boolean;
    buyable: boolean;
    rentalPrice?: string; // BigInt serialized as string
    buyPrice?: string; // BigInt serialized as string
    rentCount: number;
    buyCount: number;
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
    videoRoomPrivileges: boolean;
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
        | 'UserCommentedOnPoll'
        | 'UserLikedComment'
        | 'UserLikedPost'
        | 'UserLikedPoll'
        | 'UserLikedPollComment'
        | 'UserTaggedOnPost'
        | 'UserTaggedOnComment'
        | 'ADReceived'
        | 'UserLikedGallery'
        | 'MsgRcvd'
        | 'GroupMessageReceived'
        | 'UserTaggedOnPoll'
        | 'UserTaggedOnPollComment'
        | 'UserLikedPollComment'
        | 'UserLikedPoll';
    userId: string;
    user?: IUserProfile;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
    message?: string;
    postId: number;
    senderId: string;
    cruId: any;
    mITId: any;
    galleryId: any;
    pollId: any;
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
    blackCloakStatus: boolean;
    seriesReactions?: IUserSeriesReaction[];
    episodeReactions?: IUserEpisodeReaction[];
    polls?: IPoll[];
    votes?: IVote[];
    pollCreator: boolean;
    pollComments: PollComment[];
    pollCommentLikes: PollCommentLike[];
    pollLikes: PollLike[];
    isAdmin: boolean;
}

export interface IWatchlist {
    id: string;
    userId: string;
    movieId?: string;
    seriesId?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    movie?: IMovie;
    series?: ISeries;
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
    blackInTheDays: boolean;
    flickFlirt: boolean;
    shortFilm: boolean;
    rentalDurationHrs?: number | null;
    totalADEarned: string; // BigInt serialized as string
    rentable: boolean;
    buyable: boolean;
    rentalPrice?: string; // BigInt serialized as string
    buyPrice?: string; // BigInt serialized as string
    rentCount: number;
    buyCount: number;
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
        | 'UserCommentedOnPost'
        | 'UserCommentedOnPoll'
        | 'UserLikedComment'
        | 'UserLikedPost'
        | 'UserLikedPoll'
        | 'UserLikedPollComment'
        | 'UserTaggedOnPost'
        | 'UserTaggedOnComment'
        | 'ADReceived'
        | 'UserLikedGallery'
        | 'MsgRcvd'
        | 'GroupMessageReceived'
        | 'UserTaggedOnPoll'
        | 'UserTaggedOnPollComment'
        | 'UserLikedPollComment'
        | 'UserLikedPoll';
    userId: string;
    user?: IUserProfile;
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
    message?: string;
    postId: number;
    senderId: string;
    cruId: any;
    mITId: any;
    galleryId: any;
    pollId: any;
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
    edited: boolean;
    editedText: string?;
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
    text: string;
    likes?: number;
    author: string;
    authorId: string;
    _count: {
        likes: number;
        comments: number;
    };
    isLikedByCurrentUser: boolean;
    edited: boolean;
    editedText: string?;
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
    image_url?: string;
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

export interface ISeries {
    id: string;
    title: string;
    description: string;
    genres: string[];
    years: number;
    yearsActive?: string;
    seriesTrailerURL: string;
    landscapeURL: string;
    price?: number;
    portraitURL: string;
    rating: number;
    rated: string;
    seasons: ISeason[];
    episodes: IEpisode[];
    published: boolean;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    loveCount: number;
    likeCount: number;
    dislikeCount: number;
    sponsored: boolean;
    blackInTheDays: boolean;
    actors: IActor[];
    director: IDirector[];
    reactions: IUserSeriesReaction[];
}

export interface ISeason {
    id: string;
    seasonNumber: number;
    seriesId: string;
    series: ISeries;
    episodes: IEpisode[];
    createdAt: string;
    updatedAt: string;
    seasonTrailerURL: string;
    price?: number;
    year: number;
    actors: IActor[];
    director: IDirector[];
    rentalDurationHrs?: number | null;
    totalADEarned: string; // BigInt serialized as string
    rentable: boolean;
    buyable: boolean;
    rentalPrice?: string; // BigInt serialized as string
    buyPrice?: string; // BigInt serialized as string
    rentCount: number;
    buyCount: number;
}

export interface IEpisode {
    id: string;
    title: string;
    description: string;
    episodeNumber: number;
    duration: number;
    seasonId: string;
    season: ISeason;
    seriesId: string;
    series: ISeries;
    episodeURL: string;
    createdAt: string;
    updatedAt: string;
    actors: IActor[];
    director: IDirector[];
    price?: number;
    viewCount: number;
    loveCount: number;
    likeCount: number;
    dislikeCount: number;
    landscapeURL?: string;
    portraitURL?: string;
}

interface IUserSeriesReaction {
    id: string;
    userId: string;
    seriesId: string;
    type: 'LOVE' | 'LIKE' | 'DISLIKE';
    createdAt: string;
    updatedAt: string;
}

interface IUserEpisodeReaction {
    id: string;
    userId: string;
    episodeId: string;
    type: 'LOVE' | 'LIKE' | 'DISLIKE';
    createdAt: string;
    updatedAt: string;
}

interface ITrailer {
    id: string;
    title: string;
    description: string;
    duration: number;
    trailerURL: string;
    landscapeURL: string;
    portraitURL: string;
    createdAt: string;
    updatedAt: string;
    actors: IActor[];
    director: IDirector[];
    viewCount: number;
    loveCount: number;
    likeCount: number;
    dislikeCount: number;
    reactions: IUserTrailerReaction[];
}

interface IUserTrailerReaction {
    id: string;
    userId: string;
    trailerId: string;
    type: ReactionType;
    createdAt: string;
    updatedAt: string;
    user: IUser;
    trailer: ITrailer;
}

export type IPollType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL' | 'HYBRID';

export interface IPoll {
    isLikedByCurrentUser: any;
    id: string;
    question: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: IUserProfile;
    choices: IChoice[];
    totalVotes: number;
    expiresAt: string;
    type: IPollType; // Update to use PollType enum
    totalVotes: number;
    notifications: INotification[];
    comments: IPollComment[];
    pollLikes: IPollLike[];
    selectedChoice: string | null; // Add this line
    _count?: {
        pollLikes: number;
        comments: number;
    };
}

export interface IChoice {
    id: string;
    text: string;
    imageUrl?: string;
    pollId: string;
    poll: IPoll;
    votes: IVote[];
    voteCount: number;
    percentage: number;
    voteCount: number;
}

export interface IVote {
    id: string;
    choiceId: string;
    userId: string;
    choice: IChoice;
    user: IUserProfile;
    createdAt: string;
}

export interface IPollComment {
    id: string;
    content: string[];
    text: string;
    createdAt: Date;
    pollId: string;
    poll: IPoll;
    userId: string;
    user: IUserProfile;
    notifications: INotification[];
    dateCreated: Date;
    edited: boolean;
    editedText?: string | null;
    updatedAt: Date;
    pollCommentLikes: IPollCommentLike[];
}

export interface IPollLike {
    id: string;
    userId: string;
    user: IUserProfile;
    pollId: string;
    poll: IPoll;
    dateCreated: Date;
}

export interface IPollCommentLike {
    id: string;
    userId: string;
    pollCommentId: string;
    user: IUserProfile;
    pollComment: IPollComment;
    dateCreated: Date;
}

export type IADTransactionType = 'REWARD' | 'PURCHASE' | 'GIFT';

export interface IADTransaction {
    id: string;
    senderId: string;
    receiverId: string;
    amount: string; // BigInt serialized as string
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    initiatorId?: string; // optional
    transactionType: IADTransactionType;
}

// === Content purchase types ===
export type IContentPurchaseType = 'RENT' | 'BUY';

// === MoviePurchase ===
export interface IMoviePurchase {
    id: string;
    userId: string;
    movieId: string;
    amount: string; // BigInt serialized as string
    purchasedAt: string; // ISO date string
    expireAt: string | null; // null for permanent purchases
    purchaseType: IContentPurchaseType;
}

// === SeasonPurchase ===
export interface ISeasonPurchase {
    id: string;
    userId: string;
    seasonId: string;
    amount: string;
    purchasedAt: string;
    expireAt: string | null;
    purchaseType: IContentPurchaseType;
}
