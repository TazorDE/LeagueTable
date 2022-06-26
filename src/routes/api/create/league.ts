// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import { verifyUser } from '../verify/_verifyUser';

import dotenv from 'dotenv';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const usersDB = process.env.USERS_DB;
const leaguesDB = process.env.LEAGUES_DB;

const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});

export const post = async ({ request }: { request: any }) => {

    let { owner, ownerId, name, description } = await request.json();

    // check ownerId is valid
    const verifiedOwner = await verifyUser(usersDB, ownerId);
    if (!verifiedOwner) {
        return {
            status: 400
        }
    }

    // verify name is not already in use
    const verifiedName = await verifyName(name, ownerId);
    if (!verifiedName) {
        return {
            status: 400
        }
    }

    // create league
    let resultInsert = await couch.insert(leaguesDB, {
        owner: `${owner}`,
        ownerId: `${ownerId}`,
        name: `${name}`,
        description: `${description}`,
        events: [],
        drivers: [],
        collaborators: []
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
    };
}

async function verifyName(name: any, ownerId: any) {
    // check that owner has no league with the same name
    const leagueQuery = {
        selector: {
            ownerId: `${ownerId}`,
            name: `${name}`
        }
    };
    let result = await couch.mango(leaguesDB, leagueQuery);
    if (result.data.docs.length == 0) {
        return true;
    }
    return false;
}