<script lang="ts">
	export let useravatar: string;
	export let authenticated: boolean;
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">League Result Service</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarColor01"
			aria-controls="navbarColor01"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>

		<div class="collapse navbar-collapse" id="navbarColor01">
			<ul class="navbar-nav me-auto">
				{#if authenticated}
					<li class="nav-item">
						<a class="nav-link" href="/console"> Console </a>
					</li>
				{/if}
				<li class="nav-item">
					<a class="nav-link" href="/pricing"> Pricing </a>
				</li>
			</ul>
			<form class="d-flex">
				{#if authenticated}
					<form action="/user/logout">
						<button class="btn btn-secondary my-2 my-sm-0">
							<img
								src={useravatar}
								class="rounded-circle mb-1"
								style="min-width: 20px; max-width: 20px; max-height: 20px; min-height: 20px;"
								alt="Avatar"
							/>
							Logout
						</button>
					</form>
				{:else}
					<form action="/user/login">
						<button class="btn btn-secondary my-2 my-sm-0"> Login using Github </button>
					</form>
				{/if}
			</form>
		</div>
	</div>
</nav>
