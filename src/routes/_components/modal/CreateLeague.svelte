<script lang="ts">
	export let username = '';
	export let userid = '';
	let name = '';
	let description = '';
	async function sendLeagueCreate() {
		//validate input before sending to server
		if (name.trim() == '' || description.trim() == '') {
			alert('Please fill in all fields');
			return;
		}

		if (username == '' || userid == '') {
			alert('Something went wrong please check your login session.');
			return;
		}

		let data = {
			owner: username,
			ownerId: userid,
			name: name,
			description: description
		};

		let createResult = await fetch('/api/create/league', {
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
				'Either you already have a league of this name. Or you are not correctly logged in. Please try again later.'
			);
		}
	}
</script>

<button
	type="button"
	class="btn btn-primary mx-auto"
	data-bs-toggle="modal"
	data-bs-target="#createLeagueModal"
>
	Create new league
</button>

<div
	class="modal fade"
	id="createLeagueModal"
	tabindex="-1"
	aria-labelledby="createLeagueModalLabel"
	aria-hidden="true"
>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="createLeagueModalLabel">Create new League</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			<div class="modal-body">
				<form action="/api/create/league" method="post">
					<fieldset>
						<div class="form-group">
							<label class="col-form-label mt-4" for="leagueNameInput">League Name</label>
							<input
								type="text"
								class="form-control"
								placeholder="League Name"
								id="leagueNameInput"
								bind:value={name}
							/>
						</div>
						<div class="form-group">
							<label class="col-form-label mt-4" for="leagueDescriptionInput"
								>League Description</label
							>
							<input
								type="text"
								class="form-control"
								placeholder="League Description"
								id="leagueDescriptionInput"
								bind:value={description}
							/>
						</div>

						<br />

						<div id="alertbox" />

						{#if name.trim() !== '' && description.trim() !== ''}
							<button type="button" on:click={sendLeagueCreate} class="btn btn-primary">
								Create League
							</button>
						{:else}
							<button type="button" class="btn btn-primary" disabled> Create League </button>
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
