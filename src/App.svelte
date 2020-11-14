<script>
    import Locked from './Locked.svelte';
    import Unlocked from './Unlocked.svelte';

    let seed = null;
    let timeout = null;

    const updateLock = event => {
        seed = event.detail.seed;
    };

    const resetTimer = () => {
        if (!timeout && !seed) {
            return;
        }

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            seed = null;
        }, 10 * 60 * 1000);
    };
</script>

<svelte:window on:mousemove={resetTimer} on:mousedown={resetTimer} on:click={resetTimer} on:scroll={resetTimer} on:keyup={resetTimer} />

{#if seed}
    <Unlocked {seed} on:lock={updateLock} />
{:else}
    <Locked on:unlock={updateLock} />
{/if}
