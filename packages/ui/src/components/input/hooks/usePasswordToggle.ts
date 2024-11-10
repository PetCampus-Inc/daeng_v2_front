import { useState } from 'react';

export const usePasswordToggle = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const inputType = isShowPassword ? 'text' : 'password';

  const handleTogglePassword = () => setIsShowPassword((prev) => !prev);

  return {
    inputType,
    isShowPassword,
    handleTogglePassword,
  };
};
