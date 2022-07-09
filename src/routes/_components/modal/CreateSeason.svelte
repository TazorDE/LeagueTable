<script lang="ts">
	export let username: string = '';
	export let userId: string = '';
	export let leagueId: string = '';
	export let drivers: any;

	let page = 0;
	let threeYearsInFuture = new Date().getFullYear() + 3;

	let teamCount: number;
	let year: number;
	let seasonNr: number;
	let carclass: string;
	let game: string;
	let sprint: boolean = false;
	let quali: boolean = true;
	let points: {
		racePoints: number[];
		qualiPoints?: number[];
		sprintPoints?: number[];
		fastestLapPoint: number;
		sprintFastestLapPoint?: number;
	};
	let teams: {
		name: string;
		drivers: {
			id: string;
			events: string[];
		}[];
		color: string;
		drivercount: number;
	}[];
	let events: {
		id: string;
		date: Date;
		result: {
			raceFinishOrder: string[]; // driver ids in order of finish
			qualiFinishOrder?: string[]; // driver ids in order of finish
			sprintFinishOrder?: string[]; // driver ids in order of finish
			dnf: string[]; // driver ids that did not finish
			dsq: string[]; // driver ids that were disqualified
			timePenalties: {
				id: string; // driver id
				time: number; // time penalty (in seconds, added up)
			}[];
			fastestLap: string; // driver id
			sprintFastestLap?: string; // driver id
		};
	}[];

	async function nextPage() {
		if (page === 4) {
			return;
		}
		page += 1;
	}

	async function prevPage() {
		if (page === 0) {
			return;
		}
		page -= 1;
	}

	function addDriverToTeam(index: number) {
		console.log(index);
	}

	async function sendSeasonCreate(): Promise<void> {
		console.log(year, seasonNr, carclass, game);
	}
</script>

<button
	type="button"
	class="btn btn-sm btn-primary mx-auto"
	data-bs-toggle="modal"
	data-bs-target="#createSeasonModal"
>
	Create new season
</button>

<div
	class="modal fade"
	id="createSeasonModal"
	tabindex="-1"
	aria-labelledby="createSeasonModalLabel"
	aria-hidden="true"
>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="createSeasonModalLabel">Create new Season</h5>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			<div class="modal-body">
				<fieldset>
					{#if page == 0}
						<label for="seasonYear" class="form-label mt-4">Season Year</label>
						<input
							id="seasonYear"
							class="form-control"
							type="number"
							bind:value={year}
							placeholder="Year of the Season"
						/>

						<label for="seasonNumber" class="form-label mt-4">Season Number</label>
						<input
							id="seasonNumber"
							class="form-control"
							type="number"
							bind:value={seasonNr}
							placeholder="Number of the Season"
						/>

						<label for="seasonGame" class="form-label mt-4">Game</label>
						<input
							id="seasonGame"
							class="form-control"
							type="text"
							bind:value={game}
							placeholder="Game season is held in"
						/>

						<label for="seasonCarClass" class="form-label mt-4">
							Car Class (e.g. F1 / GT3 /...)
						</label>
						<input
							id="seasonCarClass"
							class="form-control"
							type="text"
							bind:value={carclass}
							placeholder="Class of the cars driven"
						/>
						<div class="mt-3">
							{#if game !== undefined && game.trim() !== '' && carclass !== undefined && carclass.trim() !== '' && typeof seasonNr == 'number' && typeof year == 'number' && year > 1976 && year < threeYearsInFuture}
								<button type="button" on:click={nextPage} class="btn btn-primary"> Next </button>
							{:else}
								<button type="button" on:click={nextPage} class="btn btn-primary" disabled>
									Next
								</button>
							{/if}
						</div>
					{:else if page == 1}
						<!-- sprint, quali, team count  -->
						<div class="form-check">
							<input
								class="form-check-input"
								bind:checked={quali}
								type="checkbox"
								id="qualiCheckbox"
							/>
							<label class="form-check-label" for="qualiCheckbox">
								Allow for qualifying sessions?
							</label>
						</div>

						<div class="form-check">
							<input
								class="form-check-input"
								bind:checked={sprint}
								type="checkbox"
								id="sprintCheckbox"
							/>
							<label class="form-check-label" for="sprintCheckbox"> Allow for sprint races? </label>
						</div>

						<label for="teamCount" class="form-label mt-4">Team Count</label>
						<input
							id="teamCount"
							class="form-control"
							type="number"
							bind:value={teamCount}
							placeholder="Number of teams competing"
						/>

						<div class="mt-3">
							<button type="button" on:click={prevPage} class="btn btn-secondary">
								Previous
							</button>
							{#if typeof teamCount == 'number' && teamCount > 0}
								<button type="button" on:click={nextPage} class="btn btn-primary"> Next </button>
							{:else}
								<button type="button" class="btn btn-primary" disabled> Next </button>
							{/if}
						</div>
					{:else if page == 2}
						<!-- Teamcreation, Driver assignment -->
						Teams and Drivers

						{#each Array(teamCount) as _undef, i}
							Teamname input <br />
							<button type="button" on:click={() => addDriverToTeam(i)} class="btn btn-primary">
								Add Driver
							</button>
						{/each}

						<div class="mt-3">
							<button type="button" on:click={prevPage} class="btn btn-secondary">
								Previous
							</button>
							<button type="button" on:click={nextPage} class="btn btn-primary"> Next </button>
						</div>
					{:else if page == 3}
						<!-- Points assignment -->
						Points
						<div class="mt-3">
							<button type="button" on:click={prevPage} class="btn btn-secondary">
								Previous
							</button>
							<button type="button" on:click={nextPage} class="btn btn-primary"> Next </button>
						</div>
					{:else}
						<!-- Events -->
						Events
						<div class="mt-3">
							<button type="button" on:click={prevPage} class="btn btn-secondary">
								Previous
							</button>
						</div>
					{/if}

					{#if !true}
						<div class="mt-3">
							<button type="button" on:click={sendSeasonCreate} class="btn btn-primary">
								Create Season
							</button>
						</div>
					{:else}
						<div class="mt-3">
							<button type="button" class="btn btn-primary" disabled> Create Season </button>
						</div>
					{/if}
				</fieldset>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
			</div>
		</div>
	</div>
</div>
