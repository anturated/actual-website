import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "saved_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },
};

export type SessionUser = {
  id: string;
}

export type SessionData = {
  user?: SessionUser
}
