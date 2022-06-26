// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import dotenv from 'dotenv';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const driversDB = process.env.DRIVERS_DB;

const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});

export const get = async ({ url }: { url: any }) => {
    let league = url.searchParams.get('league');

    if (!league) {
        return {
            status: 400,
            body: {
                error: 'Missing creator id'
            }
        };
    }
    const eventQuery = {
        selector: {
            league: `${league}`
        }
    }
    let queryResult = await couch.mango(driversDB, eventQuery);

    return {
        status: 200,
        body: {
            drivers: queryResult.data.docs
        }
    }

}