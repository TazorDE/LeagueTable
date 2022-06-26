// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import dotenv from 'dotenv';
import { verifyUser } from '../verify/_verifyUser';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const usersDB = process.env.USERS_DB;
const driversDB = process.env.DRIVERS_DB;

const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});

export const post = async ({ request }: any) => {
    let { creatorName, creatorId, league, drivername } = await request.json();

    // check userId is valid
    const verifiedUser = await verifyUser(usersDB, creatorId);
    if (!verifiedUser) {
        return {
            status: 400
        }
    }

    // verify driver name is valid
    const validDriver = await verifyDriver(drivername, league);
    if (!validDriver) {
        return {
            status: 400
        }
    }

    // create driver
    let resultInsert = await couch.insert(driversDB, {
        creatorName: `${creatorName}`,
        creator: `${creatorId}`,
        league: `${league}`,
        drivername: `${drivername}`
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

const verifyDriver = async (drivername: string, leagueId: string) => {

    // check if driver is in database
    const venueQuery = {
        selector: {
            drivername: `${drivername}`,
            league: `${leagueId}`
        }
    }

    let result = await couch.mango(driversDB, venueQuery);
    if (result.data.docs.length > 0) {
        return false;
    }
    return true;
}