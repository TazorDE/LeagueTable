import cookie from 'cookie';
// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import { createSecretKey } from 'crypto';
import { SignJWT } from 'jose';

import dotenv from 'dotenv';
dotenv.config();

const tokenURL = 'https://github.com/login/oauth/access_token'
const userURL = 'https://api.github.com/user'

// GH login data
const clientState = import.meta.env.VITE_CLIENT_STATE;
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

// JWT data
const jwtSecret = import.meta.env.VITE_JWT_SECRET;
const jwtExpiration = import.meta.env.VITE_JWT_EXPIRES;

// DB data
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const usersDB = process.env.USERS_DB;

export async function get({ url }: any) {
    const code: string = url.searchParams.get('code');
    const state: string = url.searchParams.get('state');

    // if state and clientState don't match, return 400
    if (state !== clientState) {
        return {
            status: 400,
            body: 'Invalid state'
        }
    }

    // get access token for user
    const accessToken = await getAccessToken(code, fetch);

    // get user info from github
    const user = await getUser(accessToken, fetch);
    let username = user.login;
    let userId = user.id;
    let avatar = user.avatar_url;

    // check if user is valid or add user to db
    await validateUser(userId, username, avatar);

    // generate jwt
    const secretKey = createSecretKey(jwtSecret, 'utf-8');

    const token = await new SignJWT({ username, userId, avatar })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${jwtExpiration}s`)
        .sign(secretKey);

    // set cookie
    const rescookie = cookie.serialize('session', token, {
        httpOnly: true,
        secure: true,
        maxAge: jwtExpiration,
        path: '/'
    });

    // return response
    return {
        status: 302,
        headers: {
            'Set-Cookie': rescookie,
            'Location': '/console'
        },
    }
}

async function getAccessToken(code: string, fetch: (arg0: string, arg1: { method: string; headers: { 'Content-Type': string; Accept: string; }; body: string; }) => any) {
    const res = await fetch(tokenURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code
        })
    });

    const json = await res.json();
    return json.access_token;
}

async function getUser(accessToken: any, fetch: (arg0: string, arg1: { headers: { Accept: string; Authorization: string; }; }) => any) {

    let userData = await fetch(userURL, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `token ${accessToken}`
        }
    });
    return userData.json();
}

// set up database
const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});

async function validateUser(userId: string, username: string, avatar: string) {

    // check if user is already in db
    const userQuery = {
        selector: {
            _id: `${userId}`
        }
    }
    let result = await couch.mango(usersDB, userQuery);
    if (result.data.docs.length == 0) {
        // if not, add user to db
        await couch.insert(usersDB, {
            _id: `${userId}`,
            username: `${username}`,
            avatar: `${avatar}`
        }
        );
    }
}