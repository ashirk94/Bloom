// The matching algorithm. Everything here is a "pure" function: it only
// looks at its arguments and returns a result, with no database or network.
// That makes it easy to test (see tests/matching.test.js).
//
// How a match is scored
// ---------------------
// Each user ranks up to five interests and five values. A rank is worth:
//
//     rank:    1st  2nd  3rd  4th  5th
//     weight:   5    4    3    2    1
//
// For every item two people share, we multiply the two weights. Sharing your
// #1 interest with someone who also has it at #1 is worth 5 x 5 = 25; if it
// is their #5 it is worth 5 x 1 = 5. Adding these up and dividing by the best
// possible total (two identical lists: 25 + 16 + 9 + 4 + 1 = 55) gives a
// number from 0 to 1.
//
// Interests and values count equally towards "compatibility". Nearby people
// get a small boost in the final ordering so that, between two equally
// compatible people, the closer one is listed first.

const RANK_WEIGHTS = [5, 4, 3, 2, 1];
const BEST_POSSIBLE = RANK_WEIGHTS.reduce((sum, w) => sum + w * w, 0); // 55

const SIMILARITY_SHARE = 0.85; // how much of the final score is compatibility
const PROXIMITY_SHARE = 0.15; // how much is being close by

const EARTH_RADIUS_KM = 6371;

// Great-circle distance between two [longitude, latitude] points, in km
// (the haversine formula)
function distanceKm([lon1, lat1], [lon2, lat2]) {
	const toRadians = (degrees) => (degrees * Math.PI) / 180;
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) ** 2;
	return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Compares two ranked lists.
// Returns { score: 0..1, shared: [items both lists contain] }
function rankedOverlap(mine = [], theirs = []) {
	const normalize = (item) => String(item).trim().toLowerCase();
	const theirRanks = theirs.slice(0, RANK_WEIGHTS.length).map(normalize);

	let total = 0;
	const shared = [];
	mine.slice(0, RANK_WEIGHTS.length).forEach((item, myRank) => {
		const theirRank = theirRanks.indexOf(normalize(item));
		// skip items they don't have, and items already counted
		if (theirRank === -1 || shared.includes(item)) return;
		total += RANK_WEIGHTS[myRank] * RANK_WEIGHTS[theirRank];
		shared.push(item);
	});

	return { score: total / BEST_POSSIBLE, shared };
}

// Scores one candidate against `me`.
// distance is in km, or null when it is unknown / not being used.
function scoreMatch(me, candidate, distance = null, maxDistanceKm = 50) {
	const interests = rankedOverlap(me.interests, candidate.interests);
	const values = rankedOverlap(me.values, candidate.values);
	const similarity = (interests.score + values.score) / 2;

	// 1 when they are next door, 0 at the edge of the search radius
	const proximity =
		distance === null ? 0 : Math.max(0, 1 - distance / maxDistanceKm);

	return {
		score: similarity * SIMILARITY_SHARE + proximity * PROXIMITY_SHARE,
		compatibility: Math.round(similarity * 100),
		sharedInterests: interests.shared,
		sharedValues: values.shared
	};
}

// Ranks candidates for `me`, best first.
//   me, candidates: objects with { interests, values, coordinates }
//                   where coordinates is [longitude, latitude] or null
//   maxDistanceKm:  people further away than this are left out
//   ignoreDistance: demo mode, match everyone regardless of location
//   limit:          how many matches to return
function rankMatches(
	me,
	candidates,
	{ maxDistanceKm = 50, ignoreDistance = false, limit = 20 } = {}
) {
	const matches = [];

	for (const candidate of candidates) {
		let distance = null;
		if (me.coordinates && candidate.coordinates) {
			distance = distanceKm(me.coordinates, candidate.coordinates);
		}

		if (!ignoreDistance) {
			if (distance === null || distance > maxDistanceKm) continue;
		}

		matches.push({
			candidate,
			distanceKm: distance,
			...scoreMatch(me, candidate, distance, maxDistanceKm)
		});
	}

	matches.sort((a, b) => b.score - a.score);
	return matches.slice(0, limit);
}

module.exports = {
	RANK_WEIGHTS,
	distanceKm,
	rankedOverlap,
	scoreMatch,
	rankMatches
};
