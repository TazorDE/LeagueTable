const ghAuthURL = 'https://github.com/login/oauth/authorize';
const clientId = import.meta.env.VITE_CLIENT_ID;
const clientState = import.meta.env.VITE_CLIENT_STATE;

export async function get() {
    return {
        status: 302,
        headers: {
            'Location': `${ghAuthURL}?client_id=${clientId}&state=${clientState}`
        }
    }
}