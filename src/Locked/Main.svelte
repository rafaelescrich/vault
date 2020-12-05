<script>
    import { genKeyPairAndSeed } from "skynet-js";
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let seedSuggestion = '';

    const unlock = async event => {
        const seed = event.target.seed.value;

        if (!seed) {
            return;
        }

        dispatch('unlock', { seed });

        if ('PasswordCredential' in window) {
            await navigator.credentials.store(
                new PasswordCredential({
                     id: `${seed.substr(0, 7)}...${seed.substr(-7)}`,
                     name: 'VAULT Seed Phrase',
                     password: seed,
                })
            );
        }
    }

    const random = () => seedSuggestion = genKeyPairAndSeed().seed;
</script>

<style>
    main {
        height: calc(100% - 64px - 64px);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        text-align: center;
    }

    svg {
        fill: var(--color-header-search);
    }

    form {
        width: 100%;
        display: flex;
        max-width: 500px;
    }

    input {
        height: 48px;
    }
    input[type=text] {
        width: calc(100% - 80px);
        padding: 0 16px;
        background: var(--color-header-search);
        border-right: 1px solid var(--color-page-background);
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
    }
    input[type=text]::placeholder {
        color: var(--color-header-placeholder);
    }

    input[type=submit] {
        color: var(--color-white);
        width: 80px;
        background: var(--color-blue);
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
        font-size: 14px;
        cursor: pointer;
        text-align: center;
    }
</style>

<main class="container">
    <svg width="128" height="128">
        <use xlink:href="#icon-lock" />
    </svg>

    <h3>
        <strong>Password Manager</strong><br>for the Decentralized Web
    </h3>

    <br>

    <form on:submit|preventDefault={unlock}>
        <input type="text" name="seed" placeholder="Your VAULT Seed Phrase" value="{seedSuggestion}" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" minlength="17" required>
        <input type="submit" value="UNLOCK">
    </form>

    <button type="button" on:click="{random}">
        <small>Need a Random Seed Phrase?</small>
    </button>
</main>
