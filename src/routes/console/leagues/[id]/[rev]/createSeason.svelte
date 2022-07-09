<script lang="ts" context="module">
	export async function load({ url, session, fetch }: any) {
		// get the league id from the url
		const leagueId = url.pathname.split('/')[3];
		// get the league revision from the url
		const leagueRev = url.pathname.split('/')[4];

		// get all drivers
		let drivers = await fetch(`/api/data/driver?league=${leagueId}`);
		drivers = (await drivers.json()).drivers;

		// get all events
		let events = await fetch(`/api/data/event?league=${leagueId}`);
		events = (await events.json()).events;

		return {
			props: {
				username: session.payload.username,
				userId: session.payload.userId,
				leagueId: leagueId,
				leagueRev: leagueRev,
				drivers: drivers,
				events: events
			}
		};
	}
</script>

<script lang="ts">
	import { getContrastColor } from '../../../../_components/functions/color';
	import { afterUpdate, beforeUpdate } from 'svelte';

	// props
	export let drivers: any;
	export let events: any;
	export let leagueId: string;
	export let leagueRev: string;
	export let userId: string;

	// technical variables
	let page = 0;
	let driverSelectIDArray: any[] = [];
	let teamsHaveNames: boolean = false;
	let teamsHaveColor: boolean = false;
	let numberOfRacePointPositions: number;
	let numberOfQualiPointPositions: number;
	let numberOfSprintPointPositions: number;
	let racePointsValid: boolean = false;
	let qualiPointsValid: boolean = false;
	let sprintPointsValid: boolean = false;
	let seasonEventCount: number;
	let eventsValid: boolean = false;
	let finishing: boolean = false;
	let teamsetter: boolean = true;

	// data variables
	let threeYearsInFuture = new Date().getFullYear() + 3;
	let teamCount: number = 0;
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
		fastestLapPointCount: number;
		sprintFastestLapPoint?: number;
	} = {
		racePoints: [],
		fastestLapPoint: 0,
		fastestLapPointCount: 0
	};
	let teams: {
		name: string;
		drivers: {
			id: string;
			events: string[];
		}[];
		color: string;
	}[] = [];

	let seasonEvents: string[] = [];
	let sprintEvents: boolean[] = [];
	let eventDates: Date[] = [];

	function nextPage(): void {
		if (page < 4) {
			page++;
		}

		if (page == 2) {
			teamsetter = false;
		}

		if (page == 3) {
			if (!points.hasOwnProperty('sprintPoints')) {
				points.sprintPoints = [];
				points.sprintFastestLapPoint = 0;
			}
			if (!points.hasOwnProperty('qualiPoints')) {
				points.qualiPoints = [];
			}
		}
	}

	function prevPage(): void {
		if (page > 0) {
			page--;
		}

		if (page == 1) {
			teamsetter = true;
		}
	}

	function setTeams(): void {
		for (let i = 0; i < teamCount; i++) {
			if (teams[i] == undefined) {
				teams.push({
					name: '',
					drivers: [],
					color: generateRandomHexColor()
				});
			}
		}
	}

	function generateRandomHexColor() {
		let letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	function driverIDtoName(id: string): string {
		return drivers.find((driver: { _id: string }) => driver._id == id).drivername;
	}

	function eventIDtoVenueCountry(id: string): { venue: string; country: string } {
		let event = events.find((event: { _id: string }) => event._id == id);
		return {
			venue: event.venue,
			country: event.country
		};
	}

	function addDriver(teamIndex: number) {
		let driver = driverSelectIDArray[teamIndex];

		if (driver == '') {
			alert('Please select a driver');
			return;
		}

		// check if driver is already in team
		if (
			teams[teamIndex].drivers.find((driverInTeam: { id: string }) => driverInTeam.id == driver)
		) {
			alert('Driver is already in team');
			return;
		}

		teams[teamIndex].drivers = [
			...teams[teamIndex].drivers,
			{
				id: driver,
				events: []
			}
		];
	}

	function removeDriver(teamIndex: number, driverId: string) {
		teams[teamIndex].drivers = teams[teamIndex].drivers.filter(
			(driver: { id: string }) => driver.id != driverId
		);

		// required for updating the DOM
		teams[teamIndex].drivers = [...teams[teamIndex].drivers];
	}

	// check that all teams < teamCount have a name
	function checkTeamsHaveNames(): void {
		teamsHaveNames = true;
		if (teams.length > 0) {
			for (let i = 0; i < teamCount; i++) {
				if (teams[i].name == '') {
					teamsHaveNames = false;
					break;
				}
			}
		}
	}

	function checkTeamsHaveColor(): void {
		teamsHaveColor = true;
		if (teams.length > 0) {
			for (let i = 0; i < teamCount; i++) {
				if (teams[i].color == '') {
					teamsHaveColor = false;
					break;
				}
			}
		}
	}

	function checkRacePoints() {
		racePointsValid = true;
		if (numberOfRacePointPositions == 0) {
			racePointsValid = false;
		} else {
			points.racePoints.forEach((point: number) => {
				// check if point is a valid number
				if (isNaN(point) || point == null) {
					racePointsValid = false;
				}
				// check if point is a positive number
				if (point < 0) {
					racePointsValid = false;
				}
			});
		}

		// check points.fastestLapPoint is a valid number
		if (points.fastestLapPoint == null) {
			racePointsValid = false;
		} else {
			if (isNaN(points.fastestLapPoint)) {
				racePointsValid = false;
			}
		}

		// check points.fastestLapPointCount is a valid number
		if (points.fastestLapPointCount == null) {
			racePointsValid = false;
		} else {
			if (isNaN(points.fastestLapPointCount)) {
				racePointsValid = false;
			}
		}
	}

	function checkQualiPoints() {
		qualiPointsValid = true;
		if (!points.hasOwnProperty('qualiPoints')) {
			return;
		}
		if (numberOfQualiPointPositions > 0) {
			// @ts-ignore
			points.qualiPoints.forEach((point: number) => {
				// check if point is a valid number
				if (isNaN(point) || point == null) {
					qualiPointsValid = false;
				}
				// check if point is a positive number
				if (point < 0) {
					qualiPointsValid = false;
				}
			});
		}
	}

	function checkSprintPoints() {
		sprintPointsValid = true;
		if (!points.sprintPoints || !points.sprintFastestLapPoint) {
			return;
		}
		if (numberOfSprintPointPositions > 0) {
			points.sprintPoints.forEach((point: number) => {
				// check if point is a valid number
				if (isNaN(point) || point == null) {
					sprintPointsValid = false;
				}
				// check if point is a positive number
				if (point < 0) {
					sprintPointsValid = false;
				}
			});
		}

		// check sprint fastest lap point is a valid number
		if (isNaN(points.sprintFastestLapPoint) || points.sprintFastestLapPoint == null) {
			sprintPointsValid = false;
		}
	}

	function checkEvents() {
		eventsValid = true;
		if (seasonEventCount == 0 || seasonEvents.length == 0) {
			eventsValid = false;
		}
		seasonEvents.forEach((event: string, i: number) => {
			if (i < seasonEventCount) {
				if (event.trim() == '' || event == undefined) {
					eventsValid = false;
				}
			}
		});
	}

	// complex updates
	afterUpdate(() => {
		checkTeamsHaveNames();
		checkTeamsHaveColor();
		checkRacePoints();
		checkQualiPoints();
		checkSprintPoints();
		checkEvents();
	});

	beforeUpdate(() => {
		setTeams();
	});

	function finish() {
		page = 5;
		finishing = true;
	}

	function unfinish() {
		page = 0;
		finishing = false;
	}

	async function buildAndSave() {
		let season: {
			game: string;
			year: number;
			number: number;
			carClass: string;
			points: {
				race: number[];
				raceFastest: number;
				raceFastestMaxPosition: number;
				quali: never[];
				sprint: never[];
				sprintFastest: number;
			};
			teams: never[];
			events: never[];
		} = {
			leagueId: leagueId,
			game: game,
			year: year,
			number: seasonNr,
			carClass: carclass,
			points: {
				race: points.racePoints,
				raceFastest: points.fastestLapPoint,
				raceFastestMaxPosition: points.fastestLapPointCount,
				quali: [],
				sprint: [],
				sprintFastest: 0
			},
			teams: [],
			events: []
		};

		// handle quali points
		if (quali) {
			if (points.hasOwnProperty('qualiPoints') && points.qualiPoints != undefined) {
				let checkBool = true;
				Array(numberOfQualiPointPositions)
					.fill(0)
					.forEach((_, i) => {
						if (
							points.qualiPoints[i] == undefined ||
							points.qualiPoints[i] == null ||
							isNaN(points.qualiPoints[i])
						) {
							checkBool = false;
						}
					});
				if (checkBool) {
					season.points.quali = [...points.qualiPoints];
				}
			}
		}
		// handle sprint points
		if (sprint) {
			if (
				points.hasOwnProperty('sprintPoints') &&
				points.sprintPoints != undefined &&
				points.hasOwnProperty('sprintFastestLapPoint')
			) {
				let checkBool = true;
				Array(numberOfSprintPointPositions)
					.fill(0)
					.forEach((_, i) => {
						if (
							points.sprintPoints[i] == undefined ||
							points.sprintPoints[i] == null ||
							isNaN(points.sprintPoints[i])
						) {
							checkBool = false;
						}
					});
				if (checkBool) {
					season.points.sprint = [...points.sprintPoints];
					season.points.sprintFastest = points.sprintFastestLapPoint || 0;
				}
			}
		}
		// handle events
		seasonEvents.forEach((event, i) => {
			if (i < seasonEventCount) {
				let eventDate: string | Date = '';
				if (eventDates[i]) {
					eventDate = new Date(eventDates[i]);
				}
				let subEvent: {
					id: string;
					date: string | Date;
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
				} = {
					id: event,
					date: eventDate,
					result: {
						raceFinishOrder: [],
						dnf: [],
						dsq: [],
						timePenalties: [],
						fastestLap: ''
					}
				};
				if (quali) {
					// add qualiFinishOrder to subEven.result
					subEvent.result.qualiFinishOrder = [];
				}
				if (sprint) {
					// add sprintFinishOrder to subEven.result
					subEvent.result.sprintFinishOrder = [];
					subEvent.result.sprintFastestLap = '';
				}
				// add event to season.events
				// @ts-ignore
				season.events.push(subEvent);
			}
		});

		// handle teams
		teams.forEach((team, i) => {
			let teamObj: any = {
				name: team.name,
				color: team.color,
				drivers: []
			};

			// add team.drivers to teamObj.drivers
			team.drivers.forEach((driver) => {
				teamObj.drivers.push({ id: driver.id, events: [] });
			});
			season.teams.push(teamObj);
		});

		let retBody: {
			season: string;
			userId: string;
		} = {
			season: JSON.stringify(season),
			userId: userId,
			leagueId: leagueId
		};

		console.log(retBody);

		// post season to server
		let createResult = await fetch('/api/create/season', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(retBody)
		});
		console.log(JSON.stringify(createResult));
		if (createResult.status == 200) {
			alert('Season created successfully');
			window.location.href = `/console/leagues/${leagueId}/${leagueRev}`;
		} else {
			alert('Error creating season');
		}
	}
</script>

<main class="container mt-4">
	<div class="row">
		<div class="col" />
		<div class="col-md-auto align-self-center">
			{#if page == 0}
				<!-- Basic season Info -->
				<div class="card mb-3">
					<h3 class="card-header">General Information</h3>
					<div class="card-body">
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
					</div>
					<div class="card-footer">
						{#if year !== undefined && year > 1976 && year < threeYearsInFuture && seasonNr !== undefined && seasonNr > 0 && game !== undefined && game.trim() !== '' && carclass !== undefined && carclass.trim() !== ''}
							<button type="button" on:click={nextPage} class="btn btn-primary">Next</button>
						{/if}
					</div>
				</div>
			{:else if page == 1}
				<!-- Quali, Sprint and Team Count -->
				<div class="card mb-3">
					<h3 class="card-header">Structure and Teams</h3>
					<div class="card-body">
						<input
							class="form-check-input"
							bind:checked={quali}
							type="checkbox"
							id="qualiCheckbox"
						/>
						<label class="form-check-label" for="qualiCheckbox">
							Allow for qualifying sessions?
						</label>
						<br />
						<input
							class="form-check-input"
							bind:checked={sprint}
							type="checkbox"
							id="sprintCheckbox"
						/>
						<label class="form-check-label" for="sprintCheckbox"> Allow for sprint races? </label>
						<br />
						<label for="teamCount" class="form-label mt-4">Team Count</label>
						<input
							id="teamCount"
							class="form-control"
							type="number"
							bind:value={teamCount}
							placeholder="Number of teams competing"
						/>
					</div>
					<div class="card-footer text-muted">
						<button type="button" on:click={prevPage} class="btn btn-dark">Previous</button>

						{#if teamCount !== undefined && teamCount > 0}
							<button type="button" on:click={setTeams} on:click={nextPage} class="btn btn-primary">
								Next
							</button>
						{/if}
					</div>
				</div>
			{:else if page == 2}
				<!-- Team Data Input -->
				<div class="card mb-3">
					<h3 class="card-header">Team and Driver informaton</h3>
					<div class="card-body">
						{#if !teamsetter}
							{#each teams as team, i}
								<div class="form-group">
									<label class="col-form-label" for="teamname{i}">Teamname</label>
									<input
										type="text"
										class="form-control"
										placeholder="Teamname"
										id="teamname{i}"
										bind:value={team.name}
									/>
									<!-- Driver selector and table -->
									<label for="teamDriverSelect{i}" class="form-label mt-4">Add Driver to Team</label
									>
									<div class="container">
										<div class="row">
											<div class="col">
												<select
													class="form-select"
													id="teamDriverSelect{i}"
													bind:value={driverSelectIDArray[i]}
												>
													<option value="" selected disabled>Select Driver</option>
													{#each drivers as driver}
														<option value={driver._id}>{driver.drivername}</option>
													{/each}
												</select>
											</div>
											<div class="col">
												<button
													type="button"
													on:click={() => {
														addDriver(i);
													}}
													class="btn btn-primary"
												>
													Add Driver
												</button>
											</div>
										</div>
									</div>

									{#if team.drivers.length > 0}
										<table class="table table-hover mt-2">
											<thead>
												<tr>
													<th>Drivername</th>
													<th>Remove</th>
												</tr>
											</thead>
											<tbody>
												{#each team.drivers as driver}
													<tr>
														<td>{driverIDtoName(driver.id)}</td>
														<td>
															<button
																type="button"
																on:click={() => {
																	removeDriver(i, driver.id);
																}}
																class="btn btn-sm btn-danger"
															>
																remove from team
															</button>
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									{/if}

									<!-- Team color picker -->
									<label class="col-form-label" for="teamColor{i}">Team Color</label>
									<div class="container">
										<div class="row">
											<div class="col-7">
												<input
													type="text"
													class="form-control"
													aria-describedby="teamColor{i}"
													bind:value={team.color}
												/>
											</div>
											<div class="col-3">
												<input
													type="color"
													class="form-control"
													id="teamColor{i}"
													bind:value={team.color}
												/>
											</div>
										</div>
									</div>
								</div>
								{#if i < teamCount - 1}
									<hr />
								{/if}
							{/each}
						{/if}
					</div>
					<div class="card-footer text-muted">
						<button type="button" on:click={prevPage} class="btn btn-dark">Previous</button>
						{#if teamsHaveNames && teamsHaveColor}
							<button type="button" on:click={nextPage} class="btn btn-primary">Next</button>
						{/if}
					</div>
				</div>
			{:else if page == 3}
				<!-- Points -->
				<div class="card mb-3">
					<h3 class="card-header">Point distribution</h3>
					<div class="card-body">
						<!-- Race Points -->
						<label for="racefinisheramountinput">
							Number of race finishers to be awarded a point
						</label>
						<input
							type="number"
							id="racefinisheramountinput"
							class="form-control"
							bind:value={numberOfRacePointPositions}
						/>
						{#if numberOfRacePointPositions > 0}
							<table class="table-hover table">
								<thead>
									<tr>
										<th>Position</th>
										<th>Points</th>
									</tr>
								</thead>
								<tbody>
									{#each Array(numberOfRacePointPositions) as _undef, i}
										<tr>
											<td>{i + 1}.</td>
											<td>
												<input
													type="number"
													class="form-control"
													bind:value={points.racePoints[i]}
													placeholder="Amount of Points"
												/>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{/if}

						<!-- Race Fastest Lap Point -->
						<label for="racefastestlappointinput">
							Points awarded for the fastest lap of the race
						</label>
						<input
							id="racefastestlappointinput"
							class="form-control"
							type="number"
							bind:value={points.fastestLapPoint}
						/>

						<label for="racefastestlappositioninput"
							>Maximum position that is awarded a fastest lap point (set to 0 to allow everyone)</label
						>
						<input
							id="racefastestlappositioninput"
							class="form-control"
							type="number"
							bind:value={points.fastestLapPointCount}
						/>

						{#if quali}
							<hr />
							<h3>Qualifying points</h3>

							<!-- Quali Points "qualiPoints" -->
							<label for="qualifinisheramountinput">
								Number of quali finishers to be awarded a point
							</label>
							<input
								id="qualifinisheramountinput"
								type="number"
								class="form-control"
								bind:value={numberOfQualiPointPositions}
							/>
							{#if numberOfQualiPointPositions > 0 && points.qualiPoints}
								<table class="table-hover table">
									<thead>
										<tr>
											<th>Position</th>
											<th>Points</th>
										</tr>
									</thead>
									<tbody>
										{#each Array(numberOfQualiPointPositions) as _undef, i}
											<tr>
												<td>{i + 1}.</td>
												<td>
													<input
														type="number"
														class="form-control"
														bind:value={points.qualiPoints[i]}
														placeholder="Amount of Points"
													/>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{/if}
						{/if}

						{#if sprint}
							<hr />
							<h3>Sprint points</h3>

							<!-- Sprint Points "sprintPoints" -->
							<label for="sprintfinisheramountinput">
								Number of sprint finishers to be awarded a point
							</label>
							<input type="number" class="form-control" bind:value={numberOfSprintPointPositions} />
							{#if numberOfSprintPointPositions > 0 && points.sprintPoints}
								<table class="table-hover table">
									<thead>
										<tr>
											<th>Position</th>
											<th>Points</th>
										</tr>
									</thead>
									<tbody>
										{#each Array(numberOfSprintPointPositions) as _undef, i}
											<tr>
												<td>{i + 1}.</td>
												<td>
													<input
														type="number"
														class="form-control"
														bind:value={points.sprintPoints[i]}
														placeholder="Amount of Points"
													/>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{/if}

							<!-- Sprint Fastest Lap Point -->
							<label for="sprintfastestlapinput">
								Points awarded for the fastest lap of the sprint
							</label>
							<input
								id="sprintfastestlapinput"
								type="number"
								class="form-control"
								bind:value={points.sprintFastestLapPoint}
							/>
						{/if}
					</div>
					<div class="card-footer text-muted">
						<button type="button" on:click={prevPage} class="btn btn-dark">Previous</button>
						{#if racePointsValid && qualiPointsValid && sprintPointsValid}
							<button type="button" on:click={nextPage} class="btn btn-primary">Next</button>
						{/if}
					</div>
				</div>
			{:else if page == 4}
				<!-- Events -->
				<div class="card mb-3">
					<h3 class="card-header">Events in Season</h3>
					<div class="card-body">
						<label for="numberofeventsinseason">Number of Events</label>
						<input
							type="number"
							id="numberofeventsinseason"
							bind:value={seasonEventCount}
							placeholder="Number of Events in Season"
							class="form-control"
						/>

						{#if seasonEventCount && seasonEventCount > 0}
							<table class="table table-hover">
								<thead>
									<tr>
										<th>Position in calendar</th>
										<th>Venue</th>
										<th>Date</th>
										{#if sprint}
											<th>Has sprint race?</th>
										{/if}
									</tr>
								</thead>
								<tbody>
									{#each Array(seasonEventCount) as _undef, i}
										<tr>
											<td>{i + 1}.</td>
											<td>
												<select class="form-control" bind:value={seasonEvents[i]}>
													<option value="" selected disabled>Select venue</option>
													{#each events as venue}
														<option value={venue._id}>{venue.country} - {venue.venue}</option>
													{/each}
												</select>
											</td>
											<td><input type="date" class="form-control" bind:value={eventDates[i]} /></td>
											{#if sprint}
												<td>
													<div class="form-check">
														<input
															class="form-check-input"
															type="checkbox"
															value=""
															bind:checked={sprintEvents[i]}
															id="sprintCheckbox{i}"
														/>
														<label class="form-check-label" for="sprintCheckbox{i}">
															Sprint Race?
														</label>
													</div>
												</td>
											{/if}
										</tr>
									{/each}
								</tbody>
							</table>
						{/if}
					</div>
					<div class="card-footer text-muted">
						<button type="button" on:click={prevPage} class="btn btn-dark">Previous</button>
						{#if eventsValid}
							<button type="button" on:click={finish} class="btn btn-primary">Finish</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
		<div class="col" />
	</div>
	{#if finishing}
		<div class="col" />
		<div class="col align-self-center">
			<div class="card mb-3">
				<div class="card-header mt-2">Confirm the data</div>
				<div class="card-body">
					<ul class="nav nav-tabs">
						<li class="nav-item">
							<a class="nav-link active" data-bs-toggle="tab" href="#general">
								General Information
							</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" data-bs-toggle="tab" href="#points">Points</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" data-bs-toggle="tab" href="#teams">Teams</a>
						</li>
						<li class="nav-item">
							<a class="nav-link" data-bs-toggle="tab" href="#events">Events</a>
						</li>
					</ul>
					<div id="myTabContent" class="tab-content">
						<div class="tab-pane fade active show" id="general">
							<table class="table table-hover">
								<tbody>
									<tr>
										<td>Year</td>
										<td>{year}</td>
									</tr>
									<tr>
										<td>Season</td>
										<td>{seasonNr}</td>
									</tr>
									<tr>
										<td>Car-class</td>
										<td>{carclass}</td>
									</tr>
									<tr>
										<td>Game</td>
										<td>{game}</td>
									</tr>
									<tr>
										<td>Sprint</td>
										<td>{sprint}</td>
									</tr>
									<tr>
										<td>Quali</td>
										<td>{quali}</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div class="tab-pane fade" id="points">
							<h3>Race Finisher Points</h3>
							<table class="table table-hover">
								<thead>
									<tr>
										<th>Position</th>
										<th>Points</th>
									</tr>
								</thead>
								<tbody>
									{#each points.racePoints as point, i}
										<tr>
											<td>{i + 1}.</td>
											<td>{point}</td>
										</tr>
									{/each}
									<tr>
										<td><h6>Fastest Lap Point:</h6></td>
										<td>{points.fastestLapPoint}</td>
									</tr>
									<tr>
										<td><h6>Maximum Position for fastestLap:</h6></td>
										<td>{points.fastestLapPointCount}</td>
									</tr>
								</tbody>
							</table>

							{#if quali}
								<h3>Qualifying Position Points</h3>
								<table class="table table-hover">
									<thead>
										<tr>
											<th>Position</th>
											<th>Points</th>
										</tr>
									</thead>
									<tbody>
										{#each points.qualiPoints as point, i}
											<tr>
												<td>{i + 1}.</td>
												<td>{point}</td>
											</tr>
										{:else}
											<tr>
												<td />
												<td>No Quali Points</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{/if}

							{#if sprint}
								<table class="table table-hover">
									<thead>
										<tr>
											<th>Position</th>
											<th>Points</th>
										</tr>
									</thead>
									<tbody>
										{#each points.sprintPoints as point, i}
											<tr>
												<td>{i + 1}.</td>
												<td>{point}</td>
											</tr>
										{:else}
											<tr>
												<td />
												<td>No finishing points for Sprint</td>
											</tr>
										{/each}
										<tr>
											<td><h6>Fastest Lap Point:</h6></td>
											<td>{points.fastestLapPoint}</td>
										</tr>
										<tr>
											<td><h6>Maximum Position for fastestLap:</h6></td>
											<td>{points.fastestLapPointCount}</td>
										</tr>
									</tbody>
								</table>
							{/if}
						</div>
						<div class="tab-pane fade" id="teams">
							<table class="table table-hover">
								<thead>
									<tr>
										<th>Team</th>
										<th>Drivers</th>
									</tr>
								</thead>
								<tbody>
									{#each teams as team}
										<tr
											style="background-color: {team.color}; color: {getContrastColor(team.color)};"
										>
											<td>{team.name}</td>
											<td>
												{#each team.drivers as driver}
													{driverIDtoName(driver.id)}
												{/each}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div class="tab-pane fade" id="events">
							<table class="table table-hover">
								<thead>
									<tr>
										<th>Event Position</th>
										<th>Country</th>
										<th>Venue</th>
										<th>Date</th>
										{#if sprint}
											<th>Sprint Event</th>
										{/if}
									</tr>
								</thead>
								<tbody>
									{#each seasonEvents as event, i}
										<tr>
											<td>{i + 1}.</td>
											<td>{eventIDtoVenueCountry(event).country}</td>
											<td>{eventIDtoVenueCountry(event).venue}</td>
											<td>{eventDates[i]}</td>
											{#if sprint}
												<td>
													{#if sprintEvents[i] == undefined}
														false
													{:else}
														{sprintEvents[i]}
													{/if}
												</td>
											{/if}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="card-footer text-muted">
					<button type="button" on:click={unfinish} class="btn btn-danger">
						Data is not correct
					</button>
					<button type="button" on:click={buildAndSave} class="btn btn-success">
						Finish and Save
					</button>
				</div>
			</div>
		</div>
		<div class="col" />
	{/if}
</main>
