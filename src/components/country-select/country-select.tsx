import { Show } from 'solid-js';
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxHiddenSelect,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemLabel,
  ComboboxTrigger,
} from '../ui/combobox';
import type { CountryCode } from './countries';
import { COUNTRIES, COUNTRY_CODES } from './countries';

import '/node_modules/flag-icons/css/flag-icons.min.css';
import { HiOutlineXMark } from 'solid-icons/hi';
import { Button } from '../ui/button';

interface Props {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  value?: CountryCode;
  defaultValue?: CountryCode;
  onSelect?: (countryCode: CountryCode | null) => void;
  availableCountries?: CountryCode[];
}

export const CountrySelect = (props: Props) => {
  const countryOptions = () => props.availableCountries ?? COUNTRY_CODES;

  return (
    <Combobox
      triggerMode="focus"
      closeOnSelection={true}
      options={countryOptions()}
      optionLabel={code => COUNTRIES[code]}
      optionValue={code => code}
      itemComponent={props => (
        <ComboboxItem item={props.item}>
          <ComboboxItemLabel class="flex items-center gap-2">
            <span class={`fi h-5 w-5 shrink-0 fi-${props.item.rawValue}`} />
            {COUNTRIES[props.item.rawValue]}
          </ComboboxItemLabel>
        </ComboboxItem>
      )}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onSelect}
    >
      <ComboboxControl>
        {state => (
          <>
            <Show when={state.selectedOptions().length > 0}>
              <span
                class={`fi mr-2 h-5 w-5 shrink-0 fi-${state.selectedOptions()[0]}`}
              />
            </Show>
            <ComboboxInput
              placeholder={props.placeholder}
              // For some reason, required on the HiddenSelect doesn't have an effect,
              // despite the conditions listed in the following link seem to be met.
              // https://stackoverflow.com/questions/6048710/can-i-apply-the-required-attribute-to-select-fields-in-html
              // Maybe because it's aria-hidden?
              required={props.required}
            />
            <Show when={state.selectedOptions().length > 0}>
              <Button variant="ghost" size="icon" onClick={() => state.clear()}>
                <HiOutlineXMark size={16} />
              </Button>
            </Show>
            <ComboboxTrigger />
          </>
        )}
      </ComboboxControl>
      <ComboboxHiddenSelect id={props.id} name={props.name} />
      <ComboboxContent />
    </Combobox>
  );
};
