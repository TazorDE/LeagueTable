// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import dotenv from 'dotenv';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const couch = new NodeCouchDb({
    auth: {
        user: dbUser,
        pass: dbPassword
    }
});


export async function verifyUser(db: string | undefined, userId: string) {
    if (!db) {
        return false;
    }

    // check that userId is in database
    const userQuery = {
        selector: {
            _id: `${userId}`
        }
    }
    let result = await couch.mango(db, userQuery);
    if (result.data.docs.length > 0) {
        return true;
    }
    return false;
}