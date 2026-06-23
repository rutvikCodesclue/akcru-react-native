interface ILoginResponse {
    session: Session;
    user: IProfile;
    vipStatus?: boolean;
    hasOtherSessions?: boolean;
    otherSessionsCount?: number;
    oldJWT?: string;
}
