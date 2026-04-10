<script lang="ts">
  interface Props {
    hints: string[];
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onsubmit: (value: string) => void;
  }

  let { hints, value = $bindable(''), placeholder = '', disabled = false, onsubmit }: Props = $props();

  let selectedIndex = $state(-1);
  let open = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);

  const filtered = $derived.by(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return hints
      .filter(h => h.toLowerCase().includes(q))
      .slice(0, 8);
  });

  const showDropdown = $derived(open && filtered.length > 0 && value.trim().length > 0);

  function handleKeydown(e: KeyboardEvent) {
    if (!showDropdown) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit(value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filtered.length) {
        submit(filtered[selectedIndex]);
      } else {
        submit(value);
      }
    } else if (e.key === 'Escape') {
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
    value = '';
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
    border: 2px solid #2a2a4a;
    border-radius: 8px;
    background: #12121f;
    color: #e8e8f0;
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  .autocomplete input:focus {
    border-color: #667eea;
  }

  .dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0.25rem 0;
    list-style: none;
    background: #1e1e36;
    border: 2px solid #2a2a4a;
    border-radius: 8px;
    margin-bottom: 4px;
    max-height: 280px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.4);
  }

  .dropdown li {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    color: #c8c8d8;
    font-size: 0.95rem;
    transition: background 0.1s;
  }

  .dropdown li:hover,
  .dropdown li.selected {
    background: #2a2a4a;
    color: #e8e8f0;
  }
</style>
