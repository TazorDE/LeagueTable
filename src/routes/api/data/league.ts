// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import dotenv from 'dotenv';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const leaguesDB = process.env.LEAGUES_DB;

const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});

export const get = async ({ url }: { url: any }) => {
    let ownerId = url.searchParams.get('owner');

    if (!ownerId) {
        return {
            status: 400,
            body: {
                error: 'Missing owner id'
            }
        };
    }

    // get all leagues with the ownerId provided
    const league_query = {
        selector: {
            ownerId: `${ownerId}`
        }
    }
    let queryResult = await couch.mango(leaguesDB, league_query);

    return {
        status: 200,
        body: {
            leagues: queryResult.data.docs
        }
    }
}