<script context="module" lang="ts">
	export async function load({ url, session, fetch }: any) {
		// get the league id from the url
		const leagueId = url.pathname.split('/')[3];
		// get the league revision from the url
		const leagueRev = url.pathname.split('/')[4];

		// get the league data
		// get all seasons
		// get all events
		let events = await fetch(`/api/data/event?league=${leagueId}`);
		events = (await events.json()).events;
		// get all drivers
		let drivers = await fetch(`/api/data/driver?league=${leagueId}`);
		drivers = (await drivers.json()).drivers;

		return {
			props: {
				username: session.payload.username,
				userId: session.payload.userId,
				leagueId: leagueId,
				events,
				drivers
			}
		};
	}
</script>

<script lang="ts">
	// @ts-ignore
	import { Tabulator } from 'tabulator-tables';
	import { onMount } from 'svelte';
	import CreateEvent from '../../../../_components/modal/CreateEvent.svelte';
	import CreateDriver from '../../../../_components/modal/CreateDriver.svelte';
	import { page } from '$app/stores';

	export let username = '';
	export let userId = '';
	export let leagueId = '';
	export let events: any = [];
	export let drivers: any = [];

	let driversTable;
	let eventsTable;
	let currentUrl: string;
	onMount(() => {
		currentUrl = window.location.href;
		eventsTable = new Tabulator('#eventsTable', {
			data: events,
			columns: [
				{ title: 'Event', field: 'venue', sorter: 'string', hozAlign: 'center' },
				{ title: 'Country', field: 'country', sorter: 'string', hozAlign: 'center' },
				{ title: 'created by', field: 'creatorName', sorter: 'string', hozAlign: 'center' }
			]
		});
		driversTable = new Tabulator('#driversTable', {
			data: drivers,
			columns: [
				{ title: 'Driver', field: 'drivername', sorter: 'string' },
				{ title: 'created by', field: 'creatorName', sorter: 'string', hozAlign: 'center' }
			]
		});
	});
</script>

<svelte:head>
	<link
		href="https://unpkg.com/tabulator-tables@5.2.7/dist/css/tabulator_midnight.min.css"
		rel="stylesheet"
	/>
</svelte:head>

<div class="d-flex flex-column justify-content-center align-items-center mt-4">
	<h3>Seasons</h3>
	<a href="{currentUrl}/createSeason">Create Season Test</a>
</div>

<hr />
<div class="d-flex flex-column justify-content-center align-items-center">
	<h3>Events</h3>
	<CreateEvent {username} {userId} {leagueId} />
	<div id="eventsTable" class="mt-4" />
</div>

<hr />
<div class="d-flex flex-column justify-content-center align-items-center">
	<h3>Drivers</h3>
	<CreateDriver {username} {userId} {leagueId} />
	<div id="driversTable" class="mt-4" />
</div>
