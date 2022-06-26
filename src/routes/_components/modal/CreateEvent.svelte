<script lang="ts">
	import { countries } from '../../_data/countries';
	export let username = '';
	export let userId = '';
	export let leagueId = '';
	let venue = '';
	let country = '';
	async function sendEventCreate() {
		// validate user input
		if (venue.trim() === '' || country.trim() === '') {
			alert('Please fill in all fields');
			return;
		}

		// validate user session
		if (username === '' || userId === '' || leagueId === '') {
			alert('Please validate you are logged in. And try again later.');
			return;
		}

		// post new event to database
		let data = {
			user: username,
			userId: userId,
			leagueId: leagueId,
			venue: venue,
			country: country
		};

		let createResult = await fetch('/api/create/event', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (createResult.ok) {
			window.location.reload();
		} else {
			alert(
				'Either you already have an event of this country and venue or you are not correctly logged in. Please try again later.'
			);
		}
	}
</script>

<button
	type="button"
	class="btn btn-sm btn-primary mx-auto"
	data-bs-toggle="modal"
	data-bs-target="#createEventModal"
>
	Create new event
</button>

<div
	class="modal fade"
	id="createEventModal"
	tabindex="-1"
	aria-labelledby="createEventModalLabel"
	aria-hidden="true"
>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="createEventModalLabel">Create new League</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			<div class="modal-body">
				<form action="/api/create/league" method="post">
					<fieldset>
						<div class="form-group">
							<label for="countrySelect" class="form-label mt-4">Country</label>
							<select class="form-select" id="countrySelect" bind:value={country}>
								<option value="" selected disabled>--Select Country--</option>
								{#each countries.countries as country}
									<option value={country.iso3}>{country.country}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label class="col-form-label mt-4" for="eventVenueInput"> Event Venue </label>
							<input
								type="text"
								class="form-control"
								placeholder="Event Venue"
								id="eventVenueInput"
								bind:value={venue}
							/>
						</div>

						<br />

						{#if venue.trim() !== '' && country.trim() !== ''}
							<button type="button" on:click={sendEventCreate} class="btn btn-primary">
								Create Event
							</button>
						{:else}
							<button type="button" class="btn btn-primary" disabled> Create Event </button>
						{/if}
					</fieldset>
				</form>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
			</div>
		</div>
	</div>
</div>
