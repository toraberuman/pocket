<script lang="ts">
  import PocketIcon from "$lib/components/PocketIcon.svelte";

  type Section = "back" | "plan" | "expense" | "package" | "cart";

  let { slug, active = "plan" }: { slug: string; active?: Section } = $props();

  const links = $derived([
    { key: "back", href: "/", label: "Back", icon: "chevron-left" },
    { key: "plan", href: `/trips/${slug}`, label: "Plan", icon: "calendar" },
    { key: "expense", href: `/trips/${slug}/expense`, label: "Expense", icon: "receipt" },
    { key: "package", href: `/trips/${slug}/package`, label: "Package", icon: "briefcase" },
    { key: "cart", href: `/trips/${slug}/cart`, label: "Cart", icon: "cart" }
  ] as const);
</script>

<nav class="trip-menu" aria-label="Trip navigation">
  {#each links as link}
    <a class:active={link.key === active} href={link.href} aria-current={link.key === active ? "page" : undefined}>
      <span><PocketIcon name={link.icon} size={20} /></span>
      <small>{link.label}</small>
    </a>
  {/each}
</nav>

<style>
  .trip-menu {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    display: flex;
    justify-content: center;
    gap: clamp(.2rem, 2vw, .8rem);
    min-height: 4rem;
    padding: .45rem 1rem;
    border-top: 1px solid color-mix(in srgb, var(--color-border) 55%, transparent);
    background: color-mix(in srgb, var(--color-background) 95%, transparent);
    backdrop-filter: blur(10px);
  }

  .trip-menu a {
    display: grid;
    place-items: center;
    gap: .2rem;
    min-width: 3.6rem;
    color: var(--color-muted-foreground);
    transition: color 300ms ease;
  }

  .trip-menu a:hover,
  .trip-menu a.active {
    color: var(--color-accent);
  }

  .trip-menu span {
    display: inline-grid;
    place-items: center;
  }

  .trip-menu small {
    font-family: var(--font-pocket-mono);
    font-size: .56rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
</style>
