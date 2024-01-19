import { Component } from 'solid-js';

export interface CheckboxProps {
  checked?: boolean;
  label: string;
  id: string;
  onChange(checked: boolean): void;
}

export const Checkbox: Component<CheckboxProps> = props => {
  return (
    <div class="inline-flex items-center">
      <label
        class="relative flex items-center p-2 rounded-full cursor-pointer"
        for={props.id}
      >
        <input
          type="checkbox"
          checked={props.checked}
          class="peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-zinc-500 transition-all checked:border-violet-700 checked:bg-violet-700"
          id={props.id}
          onChange={e => props.onChange(e.currentTarget.checked)}
        />
        <span class="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </span>
      </label>
      <label
        class="mt-[-1px] font-light text-zinc-300 cursor-pointer select-none"
        for={props.id}
      >
        {props.label}
      </label>
    </div>
  );
};
