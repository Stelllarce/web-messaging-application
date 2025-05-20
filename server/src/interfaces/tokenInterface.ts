export interface IRefreshToken {
    refreshToken: string;
}

export interface  IToken  extends IRefreshToken {
    accessToken: string;
}