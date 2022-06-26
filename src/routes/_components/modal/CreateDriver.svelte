<script lang="ts">
	export let username = '';
	export let userId = '';
	export let leagueId = '';
	let driver = '';
	async function sendDriverCreate() {
		// validate user input
		if (driver.trim() === '') {
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
			creatorName: username,
			creatorId: userId,
			league: leagueId,
			drivername: driver
		};

		let createResult = await fetch('/api/create/driver', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		if (createResult.ok) {
			window.location.reload();
		} else {
			alert('Driver of this name already exists or you are not correctly logged in.');
		}
	}
</script>

<button
	type="button"
	class="btn btn-sm btn-primary mx-auto"
	data-bs-toggle="modal"
	data-bs-target="#createDriverModal"
>
	Create new driver
</button>

<div
	class="modal fade"
	id="createDriverModal"
	tabindex="-1"
	aria-labelledby="createDriverModalLabel"
	aria-hidden="true"
>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="createDriverModalLabel">Create new League</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			<div class="modal-body">
				<form action="/api/create/league" method="post">
					<fieldset>
						<div class="form-group">
							<label class="col-form-label mt-4" for="eventVenueInput"> Driver Name </label>
							<input
								type="text"
								class="form-control"
								placeholder="Event Driver"
								id="driverInput"
								bind:value={driver}
							/>
						</div>

						<br />

						{#if driver.trim() !== ''}
							<button type="button" on:click={sendDriverCreate} class="btn btn-primary">
								Create Driver
							</button>
						{:else}
							<button type="button" class="btn btn-primary" disabled> Create Driver </button>
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
