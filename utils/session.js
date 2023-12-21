import { withIronSession } from 'next-iron-session';

export default function withSession(handler) {
  return withIronSession(handler, {
    password: 'password',
    cookieName: 'session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    }
  });
}