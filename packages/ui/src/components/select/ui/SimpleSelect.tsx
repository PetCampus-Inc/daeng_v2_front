import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from './Select';

interface SimpleSelectProps {
  value?: string;
  options?: string[];
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
}

const SimpleSelect = ({
  options,
  placeholder,
  disabled = false,
  value,
  onValueChange,
  className,
}: SimpleSelectProps) => {
  return (
    <Select disabled={disabled} value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option, index) => {
          return (
            <SelectItem value={option} key={index}>
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
export { SimpleSelect };
