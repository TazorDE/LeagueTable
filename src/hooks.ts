// esm imports
import type { GetSession } from '@sveltejs/kit';
import * as cookie from 'cookie';
import { createSecretKey } from 'crypto';
import { jwtVerify } from 'jose';

// env variables
const secret = import.meta.env.VITE_JWT_SECRET;

export const getSession: GetSession = async (event) => {
    // @ts-ignore
    const cookies = cookie.parse(event.request.headers.get('cookie') || '');
    try {
        if (cookies.session) {
            const session = cookies.session;
            // @ts-ignore
            let res = await validateSession(session);
            if (res.valid) {
                return {
                    authenticated: true,
                    payload: res.payload
                };
            }
        }
    } catch (error) {
        console.error(error);
    }

    // by default user is not authenticated
    return {
        authenticated: false,
    }
}

async function validateSession(session: string) {
    // generate decode key
    if (secret === undefined) {
        return {
            valid: false,
            payload: null
        }
    }
    const secretKey = createSecretKey(secret, 'utf-8');
    // decode session jwt
    try {
        const { payload } = await jwtVerify(session, secretKey);
        return {
            valid: true,
            payload: payload
        }
    } catch (error) {
        return {
            valid: false,
            payload: null
        }
    }
}
