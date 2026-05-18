import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null
                if (
                    credentials.username === process.env.ADMIN_USERNAME &&
                    credentials.password === process.env.ADMIN_PASSWORD
                ) {
                    return {
                        id: '1',
                        name: 'Admin',
                        email: 'admin@system.local',
                        role: 'admin'
                    }
                }
                return null
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: '/login' },
    callbacks: {
        async jwt({ token, user }) {
            // On sign in, set user info in token
            if (user) {
                token.sub = user.id
                token.email = user.email
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            // Pass token data to session
            if (session.user) {
                session.user.id = token.sub
                session.user.email = token.email
                session.user.role = token.role
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard/whatsapp`
        },
    },
}
