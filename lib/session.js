import { withIronSession } from 'next-iron-session';
import { serialize, parse } from 'cookie';

const sessionConfig = {
  password: "12345678901234567890123456789012",
  cookieName: "webauthncookie",
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 86400,
    sameSite: 'strict',
    path: '/',
  },
};

export function withSession(handler) {
  return withIronSession(handler, sessionConfig);
}
