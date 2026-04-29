<script lang="ts">
  import type { PageData, ActionData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
  <title>Admin Login</title>
</svelte:head>

<main class="shell admin-login">
  <section class="login-card card">
    <p class="eyebrow">Admin</p>
    <h1>{data.isAdmin ? "You're already in admin mode." : "Enter admin mode"}</h1>
    <p>Use the admin password to unlock trip creation, edit access management, and protected routes.</p>

    {#if !data.isAdmin}
      <form method="post">
        <label class="field">
          <span>Password</span>
          <input type="password" name="password" required />
        </label>
        {#if form?.message}<p class="message">{form.message}</p>{/if}
        <button type="submit" formaction="?/login">Login</button>
      </form>
    {:else}
      <a class="back" href="/">Back to home</a>
    {/if}
  </section>
</main>

<style>
  .admin-login {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px 0;
  }
  .login-card {
    width: min(560px, 100%);
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
  form {
    display: grid;
    gap: 14px;
    margin-top: 18px;
  }
  .field {
    display: grid;
    gap: 8px;
  }
  .field input {
    padding: 14px 15px;
    border-radius: 18px;
    border: 1px solid var(--border);
  }
  button,
  .back {
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
