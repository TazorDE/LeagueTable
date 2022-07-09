// @ts-ignore
import NodeCouchDb from 'node-couchdb';
import { verifyUser } from '../verify/_verifyUser';

import dotenv from 'dotenv';
dotenv.config();

// database setup
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const usersDB = process.env.USERS_DB;
const seasonsDB = process.env.SEASONS_DB;

const couch = new NodeCouchDb({
  auth: {
    user: dbUser,
    pass: dbPassword
  }
});

export const post = async ({ request }: { request: any }) => {
  let { userId, season, leagueId } = await request.json();

  season = JSON.parse(season);

  // check ownerId is valid
  const verifiedOwner = await verifyUser(usersDB, userId);
  if (!verifiedOwner) {
    return {
      status: 401
    }
  }

  // check this combination of game, year and seasonNr is not already in use
  const verifiedSeason = await verifySeason(season.game, season.year, season.number, leagueId);
  if (!verifiedSeason) {
    return {
      status: 400
    }
  }

  // create season
  const result = await couch.insert(seasonsDB, season).then(async (result: any) => {
    return result.data.ok;
  });
  if (result) {
    return {
      status: 200,
      body: {
        season: season
      }
    }
  }
  return {
    status: 500
  }
}

async function verifySeason(game: string, year: number, number: number, leagueId: string) {
  if (!game || !year || !number || !leagueId) {
    return false;
  }

  const seasonQuery = {
    selector: {
      leagueId: leagueId,
      game: game,
      year: year,
      seasonNr: number
    }
  };
  let result = await couch.mango(seasonsDB, seasonQuery);
  if (result.data.docs.length == 0) {
    return true;
  }
  return false;
}