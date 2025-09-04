interface ILoginResponse {
    session: Session;
    user: IProfile;
    hasOtherSessions?: boolean;
    otherSessionsCount?: number;
    oldJWT?: string;
}
