<script lang="ts">
  interface Props {
    hints: string[];
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onsubmit: (value: string) => void;
  }

  let {
    hints,
    value = $bindable(""),
    placeholder = "",
    disabled = false,
    onsubmit,
  }: Props = $props();

  let selectedIndex = $state(-1);
  let open = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);

  const sorted = $derived([...hints].sort((a, b) => a.localeCompare(b)));

  const filtered = $derived.by(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    // Prefix matches first, then substring matches — all alphabetical
    const prefix: string[] = [];
    const substring: string[] = [];
    for (const h of sorted) {
      const lower = h.toLowerCase();
      if (lower.startsWith(q)) prefix.push(h);
      else if (lower.includes(q)) substring.push(h);
    }
    return [...prefix, ...substring].slice(0, 8);
  });

  const showDropdown = $derived(
    open && filtered.length > 0 && value.trim().length > 0,
  );

  function handleKeydown(e: KeyboardEvent) {
    if (!showDropdown) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit(value);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filtered.length) {
        submit(filtered[selectedIndex]);
      } else {
        submit(value);
      }
    } else if (e.key === "Escape") {
      open = false;
      selectedIndex = -1;
    }
  }

  function handleInput() {
    open = true;
    selectedIndex = -1;
  }

  function select(item: string) {
    submit(item);
  }

  function submit(val: string) {
    if (!val.trim()) return;
    onsubmit(val.trim());
    value = "";
    open = false;
    selectedIndex = -1;
  }

  function handleFocus() {
    open = true;
  }

  function handleBlur() {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      open = false;
      selectedIndex = -1;
    }, 150);
  }
</script>

<div class="autocomplete">
  <input
    bind:this={inputEl}
    type="text"
    bind:value
    {placeholder}
    {disabled}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onfocus={handleFocus}
    onblur={handleBlur}
    autofocus
  />
  {#if showDropdown}
    <ul class="dropdown">
      {#each filtered as item, i}
        <li
          class:selected={i === selectedIndex}
          onmousedown={() => select(item)}
        >
          {item}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .autocomplete {
    position: relative;
    flex: 1;
  }

  .autocomplete input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-gold);
    background: var(--color-cream);
    color: var(--color-ink);
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
    font-family: "Source Serif 4", Georgia, serif;
  }

  .autocomplete input:focus {
    border-color: var(--color-crimson);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    background: var(--color-cream);
    border: 1px solid var(--color-gold);
    margin-top: 4px;
    max-height: 280px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .dropdown li {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    color: #555;
    font-size: 0.95rem;
    font-family: "Source Serif 4", Georgia, serif;
    transition: background 0.1s;
    border-bottom: 1px solid #ede0c4;
  }

  .dropdown li:last-child {
    border-bottom: none;
  }

  .dropdown li:hover,
  .dropdown li.selected {
    background: var(--color-parchment);
    color: var(--color-ink);
  }
</style>
