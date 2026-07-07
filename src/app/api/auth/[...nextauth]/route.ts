import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = NextAuth(authOptions) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = NextAuth(authOptions) as any;
