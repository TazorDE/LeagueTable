<script context="module" lang="ts">
	export async function load({ session, fetch }: { session: any; fetch: any }) {
		// get leagues with owner = session.payload.userId
		let leagues = await fetch(`/api/data/league?owner=${session.payload.userId}`);
		leagues = (await leagues.json()).leagues;
		return {
			props: {
				authenticated: session.authenticated,
				username: session.payload.username,
				useravatar: session.payload.avatar,
				userid: session.payload.userId,
				leagueList: leagues
			}
		};
	}
</script>

<script lang="ts">
	import LeagueCard from '../../_components/cards/LeagueCard.svelte';
	import CreateLeague from '../../_components/modal/createLeague.svelte';

	export let username: string;
	export let userid: string;
	export let leagueList: any[];
</script>

<div class="d-flex flex-column justify-content-center align-items-center">
	<div class="mt-4">
		<CreateLeague {username} {userid} />
	</div>
	<!-- Leagues created by user -->
	<div class="d-inline-flex flex-wrap justify-content-center mx-20 mt-4">
		{#each leagueList as league}
			<LeagueCard
				id={league._id}
				rev={league._rev}
				owner={league.owner}
				name={league.name}
				description={league.description}
			/>
		{/each}
	</div>
	<!-- Leagues user is collaborator -->
</div>
