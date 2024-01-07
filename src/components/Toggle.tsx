import type { JSX } from 'solid-js/jsx-runtime';

export interface ToggleProps {
  checked?: boolean;
  label?: string | JSX.Element;
  onChange: (checked: boolean) => void;
}

export function Toggle(props: ToggleProps) {
  let checkboxRef: HTMLInputElement | undefined;

  return (
    <label class="flex items-center gap-2 cursor-pointer">
      {props.label ?? ''}
      <div class="rounded-2xl w-10 h-6 flex items-center p-1 bg-zinc-600 [&:has(input:checked)]:bg-violet-600 transition-colors">
        <input
          type="checkbox"
          class="peer hidden"
          checked={props.checked}
          ref={checkboxRef}
          onChange={e => props.onChange((e.target as HTMLInputElement).checked)}
        />
        <div class="rounded-full w-4 h-4 bg-slate-100 ml-0 peer-checked:ml-4 transition-[margin-left]"></div>
      </div>
    </label>
  );
}
