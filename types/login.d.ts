interface ILoginResponse {
    session: Session;
    user: IProfile;
    vipStatus?: boolean;
    movieSlug?: string | null;
    movieSlugs?: string[] | null;
    hasOtherSessions?: boolean;
    otherSessionsCount?: number;
    oldJWT?: string;
}

interface IAuthMeResponse {
    success?: boolean;
    user: IProfile;
    vipStatus?: boolean;
    movieSlug?: string | null;
    movieSlugs?: string[] | null;
}
