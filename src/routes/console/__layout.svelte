<script context="module" lang="ts">
	export async function load({ session }: { session: any }) {
		if (!session.authenticated) {
			return { redirect: '/', status: 302 };
		}
		return {};
	}
</script>

<script lang="ts">
</script>

<svelte:head>
	<title>Console</title>
</svelte:head>

<main>
	<slot />
</main>
