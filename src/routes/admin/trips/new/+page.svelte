<script lang="ts">
  import type { ActionData } from "./$types";
  import { currencyOptions, defaultCurrencyCode } from "$lib/currencies";

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>Create Trip</title>
</svelte:head>

<main class="shell new-trip">
  <section class="card new-trip__panel">
    <p class="eyebrow">Admin mode</p>
    <h1>Create a new trip</h1>
    <p>Set the trip shell first. You can add itinerary items immediately after this in the editor.</p>

    <form method="post" class="trip-form">
      <div class="grid">
        <label class="field">
          <span>Slug</span>
          <input name="slug" placeholder="2026korea" required />
        </label>
        <label class="field">
          <span>Title</span>
          <input name="title" placeholder="2026 Korea Spring Trip" required />
        </label>
        <label class="field">
          <span>Destination</span>
          <input name="destination" placeholder="South Korea" required />
        </label>
        <label class="field">
          <span>Travelers</span>
          <input type="number" name="travelerCount" value="1" min="1" />
        </label>
        <label class="field">
          <span>Main currency</span>
          <select name="defaultCurrency">
            {#each currencyOptions as option}
              <option value={option.code} selected={option.code === defaultCurrencyCode}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label class="field">
          <span>Start date</span>
          <input type="date" name="startDate" required />
        </label>
        <label class="field">
          <span>End date</span>
          <input type="date" name="endDate" required />
        </label>
        <label class="field field--span-2">
          <span>Cover image URL</span>
          <input name="coverImageUrl" />
        </label>
        <label class="field field--span-2">
          <span>View password</span>
          <input type="password" name="viewPassword" placeholder="Optional" />
        </label>
        <label class="field field--span-2">
          <span>Edit password</span>
          <input type="password" name="editPassword" placeholder="Optional" />
        </label>
        <label class="checkbox field--span-2">
          <input type="checkbox" name="isPrivate" />
          <span>Mark this trip as private on the home screen</span>
        </label>
      </div>
      {#if form?.message}<p class="message">{form.message}</p>{/if}
      <button type="submit" formaction="?/create">Create trip</button>
    </form>
  </section>
</main>

<style>
  .new-trip {
    padding: 32px 0 56px;
  }
  .new-trip__panel {
    padding: 28px;
    background: #fff;
  }
  h1 {
    margin: 0 0 10px;
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 4vw, 3rem);
    line-height: 1;
  }
  p {
    color: var(--muted);
  }
  .trip-form {
    display: grid;
    gap: 16px;
    margin-top: 18px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .field {
    display: grid;
    gap: 8px;
  }
  .field input,
  .field select {
    padding: 14px 15px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: #fff;
    font: inherit;
  }
  .field--span-2 {
    grid-column: span 2;
  }
  .checkbox {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .checkbox span {
    color: var(--ink);
  }
  button {
    width: fit-content;
    padding: 12px 16px;
    border-radius: 999px;
    border: 0;
    background: #1d2433;
    color: white;
  }
  .message {
    color: var(--accent);
    font-weight: 600;
    margin: 0;
  }
</style>
