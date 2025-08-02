import { Show } from 'solid-js';
import type { CountryCode } from '../../domains/vocabularies/model/countries';
import {
  COUNTRIES,
  COUNTRY_CODES,
} from '../../domains/vocabularies/model/countries';

import '/node_modules/flag-icons/css/flag-icons.min.css';
import { HiOutlineXMark } from 'solid-icons/hi';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectHiddenSelect,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Props {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  value?: CountryCode;
  clearable?: boolean;
  defaultValue?: CountryCode;
  onSelect?: (countryCode: CountryCode | null) => void;
  availableCountries?: CountryCode[];
}

export const CountrySelect = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;
  const countryOptions = () => props.availableCountries ?? COUNTRY_CODES;

  function onSelect(countryCode: CountryCode | null) {
    props.onSelect?.(countryCode);
    setTimeout(() => inputRef?.blur(), 100);
  }

  return (
    <Select
      closeOnSelection={true}
      options={countryOptions()}
      optionValue={code => code}
      itemComponent={props => (
        <SelectItem class="flex items-center gap-2" item={props.item}>
          <span class={`fi h-5 w-5 shrink-0 fi-${props.item.rawValue}`} />
          {COUNTRIES[props.item.rawValue]}
        </SelectItem>
      )}
      placeholder={props.placeholder}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={onSelect}
    >
      <SelectTrigger>
        <SelectValue<CountryCode> class="flex grow items-center gap-2">
          {s => (
            <>
              <span class={`fi h-5 w-5 shrink-0 fi-${s.selectedOption()}`} />
              {COUNTRIES[s.selectedOption()]}
              <Show when={props.clearable && s.selectedOptions().length > 0}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => s.clear()}
                  class="ml-auto"
                >
                  <HiOutlineXMark size={16} />
                </Button>
              </Show>
            </>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectHiddenSelect id={props.id} name={props.name} />
      <SelectContent />
    </Select>
  );
};
