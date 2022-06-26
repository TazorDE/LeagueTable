// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import dotenv from 'dotenv';
import { verifyUser } from '../verify/_verifyUser';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const usersDB = process.env.USERS_DB;
const eventsDb = process.env.EVENTS_DB;

const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});

export const post = async ({ request }: any) => {
    let { user, userId, leagueId, venue, country } = await request.json();

    // check userId is valid
    const verifiedUser = await verifyUser(usersDB, userId);
    if (!verifiedUser) {
        return {
            status: 400
        }
    }

    // verify venue is not already in use
    const verifiedVenue = await verifyVenue(venue, country, userId, leagueId);
    if (!verifiedVenue) {
        return {
            status: 400
        }
    }

    // create venue
    let resultInsert = await couch.insert(eventsDb, {
        creatorName: `${user}`,
        creator: `${userId}`,
        league: `${leagueId}`,
        venue: `${venue}`,
        country: `${country}`,
    }).then(async (result: any) => {
        return result.data.ok;
    });

    if (resultInsert) {
        return {
            status: 200
        };
    }
    return {
        status: 400
    }
}

const verifyVenue = async (venue: string, country: string, userId: string, leagueId: string) => {

    // check if venue is in database
    const venueQuery = {
        selector: {
            venue: `${venue}`,
            country: `${country}`,
            league: `${leagueId}`,
        }
    }

    let result = await couch.mango(eventsDb, venueQuery);
    if (result.data.docs.length > 0) {
        return false;
    }
    return true;
}