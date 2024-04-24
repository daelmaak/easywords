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
import { COUNTRIES, COUNTRY_CODES, CountryCode } from './countries';

import '/node_modules/flag-icons/css/flag-icons.min.css';

interface Props {
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: CountryCode;
  onSelect?: (countryCode: CountryCode) => void;
}

export const CountrySelect = (props: Props) => {
  return (
    <Combobox
      id={props.id}
      name={props.name}
      closeOnSelection={true}
      options={COUNTRY_CODES}
      optionLabel={code => COUNTRIES[code]}
      optionValue={code => code}
      itemComponent={props => (
        <ComboboxItem item={props.item}>
          <ComboboxItemLabel class="flex items-center gap-2">
            <span class={`w-5 h-5 fi fi-${props.item.rawValue}`} />
            {COUNTRIES[props.item.rawValue]}
          </ComboboxItemLabel>
        </ComboboxItem>
      )}
      defaultValue={props.defaultValue}
      onChange={props.onSelect}
    >
      <ComboboxControl>
        {state => (
          <>
            <span class={`w-5 h-5 mr-2 fi fi-${state.selectedOptions()[0]}`} />
            <ComboboxInput placeholder={props.placeholder} />
            <ComboboxTrigger />
          </>
        )}
      </ComboboxControl>
      {/* The value and name is projected into it so that it can be used in HTML forms on submit */}
      <ComboboxHiddenSelect />
      <ComboboxContent />
    </Combobox>
  );
};
