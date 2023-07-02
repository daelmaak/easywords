export interface ProgressProps {
  percentage: number;
  class?: string;
}

export function Progress(props: ProgressProps) {
  return (
    <div
      class={`h-2 rounded-md overflow-hidden appearance-none bg-zinc-600 ${
        props.class ?? ''
      }`}
    >
      <span
        class="block mr-auto h-full bg-green-600 transition-[width]"
        style={{ width: props.percentage + '%' }}
      ></span>
    </div>
  );
}
