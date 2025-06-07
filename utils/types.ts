type TokenPayloadType = {
  access_token?: string;
  apiuser?: string;
  language?: string;
  openId?: string;
  operateId?: string;
  timestamp: Date | number;
  userId?: string;
  checkcode?: string;
  [key: string]: any;
};

type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};
type CookieType = {
  name: string;
  value: string;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
};

export { CookieType, TokenPayloadType, UserType };
