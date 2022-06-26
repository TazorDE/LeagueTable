<script context="module" lang="ts">
	import Header from './_components/Header.svelte';

	export async function load({ session }: { session: any }) {
		if (session.authenticated) {
			return {
				props: {
					authenticated: session.authenticated,
					username: session.payload.username,
					useravatar: session.payload.avatar,
					userid: session.payload.userId
				}
			};
		}
		return {
			props: {
				authenticated: session.authenticated
			}
		};
	}
</script>

<script lang="ts">
	//@ts-nocheck
	export let useravatar: string;
	export let authenticated: boolean;
</script>

<svelte:head>
	<!-- CSS only -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootswatch@5/dist/darkly/bootstrap.min.css"
	/>
	<!-- JavaScript Bundle with Popper -->
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-pprn3073KE6tl6bjs2QrFaJGz5/SUsLqktiwsUTF55Jfv3qYSDhgCecCxMW52nD2"
		crossorigin="anonymous"></script>
</svelte:head>

<!-- Header -->
<Header {authenticated} {useravatar} />

<main>
	<slot />
</main>

<!-- Footer -->
