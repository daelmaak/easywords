import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { COUNTRIES, COUNTRY_CODES, CountryCode } from './countries';

import '/node_modules/flag-icons/css/flag-icons.min.css';

interface Props {
  onSelect: (countryCode: CountryCode) => void;
}

export const CountrySelect = (props: Props) => {
  return (
    <Select
      options={COUNTRY_CODES}
      itemComponent={props => (
        <SelectItem item={props.item}>
          <span class="flex items-center gap-2">
            <span class={`w-5 h-5 fi fi-${props.item.rawValue}`} />
            {COUNTRIES[props.item.rawValue]}
          </span>
        </SelectItem>
      )}
      onChange={props.onSelect}
    >
      <SelectTrigger class="h-8">
        <SelectValue<string>>{s => s.selectedOption()}</SelectValue>
      </SelectTrigger>
      <SelectContent />
    </Select>
  );
};
