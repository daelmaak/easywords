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
  required?: boolean;
  defaultValue?: CountryCode;
  onSelect?: (countryCode: CountryCode) => void;
}

export const CountrySelect = (props: Props) => {
  return (
    <Combobox
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
      triggerMode="focus"
      onChange={props.onSelect}
    >
      <ComboboxControl>
        {state => (
          <>
            <span class={`w-5 h-5 mr-2 fi fi-${state.selectedOptions()[0]}`} />
            <ComboboxInput
              placeholder={props.placeholder}
              // For some reason, required on the HiddenSelect doesn't have an effect,
              // despite the conditions listed in the following link seem to be met.
              // https://stackoverflow.com/questions/6048710/can-i-apply-the-required-attribute-to-select-fields-in-html
              // Maybe because it's aria-hidden?
              required={props.required}
            />
            <ComboboxTrigger />
          </>
        )}
      </ComboboxControl>
      <ComboboxHiddenSelect id={props.id} name={props.name} />
      <ComboboxContent />
    </Combobox>
  );
};
