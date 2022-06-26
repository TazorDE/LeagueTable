<script lang="ts">
	export let id = '';
	export let rev = '';
	export let owner = '';
	export let name = '';
	export let description = '';
</script>

<div class="card border-dark m-3" style="max-width: 20rem;">
	<div class="card-header">{name}</div>
	<div class="card-body">
		<h6 class="card-subtitle">{description}</h6>
		<div class="d-inline-flex p-2 justify-center">
			<a href="/console/leagues/{id}/{rev}">
				<button type="button" class="btn btn-primary mx-1"> Edit League </button>
			</a>
			<br />
			<a href="/league/{id}">
				<button type="button" class="btn btn-info mx-1"> Visit League </button>
			</a>
		</div>
	</div>
	<div class="card-footer text-muted">{owner}</div>
</div>
