import * as cookie from 'cookie';

export async function get() {
    // invalidate session cookie
    const rescookie = cookie.serialize('session', '', {
        httpOnly: true,
        secure: true,
        maxAge: 0,
        path: '/'
    });

    // return response
    return {
        status: 302,
        headers: {
            'Set-Cookie': rescookie,
            Location: '/'
        }
    };

}