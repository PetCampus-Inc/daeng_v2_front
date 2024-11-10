import { Input as BaseInput, type InputProps } from './Input';
import { PasswordInput } from './PasswordInput';
import { SearchInput } from './SearchInput';

const Input = Object.assign(BaseInput, {
  Password: PasswordInput,
  Search: SearchInput,
});

export { Input, InputProps };
