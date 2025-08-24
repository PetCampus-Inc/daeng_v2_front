// use-uploader.ts
import { useEffect, useRef, useState } from "react";


export type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export type UseUploaderOptions = {
  value?: FileItem[];                // controlled
  defaultValue?: FileItem[];         // uncontrolled
  onChange?: (next: FileItem[]) => void;

  max?: number;                      // 기본: 무제한
};

export type UseUploaderReturn = {
  files: FileItem[];
  state: "empty" | "partial" | "full";
  isEmpty: boolean;
  isFull: boolean;

  open: () => void;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  reset: () => void;

  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.RefObject<HTMLInputElement>;
  };
};

export function useUploader(options: UseUploaderOptions = {}): UseUploaderReturn {
  const {
    value,
    defaultValue,
    onChange,
    max = Infinity,
  } = options;

  const inputRef = useRef<HTMLInputElement>(null);
  const [inner, setInner] = useState<FileItem[]>(defaultValue ?? []);
  const createdUrls = useRef(new Set<string>());

  const files = value ?? inner;

  const setFiles = (next: FileItem[]) => {
    onChange?.(next);
    if (value === undefined) setInner(next);
  };

  const isEmpty = files.length === 0;
  const isFull = files.length >= max;
  const state: UseUploaderReturn["state"] = isEmpty ? "empty" : isFull ? "full" : "partial";

  const toId = (f: File) =>
    `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 8)}`;

  const makeItem = (f: File): FileItem => {
    const url = URL.createObjectURL(f);
    createdUrls.current.add(url);
    return { id: toId(f), file: f, previewUrl: url };
  };

  const clampToMax = (incoming: File[], currentLen: number) =>
    incoming.slice(0, Math.max(0, max - currentLen));

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;
    const limited = clampToMax(incoming, files.length);
    if (!limited.length) return;
    const items = limited.map(makeItem);
    setFiles([...files, ...items]);
  };

  const removeFile = (id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.previewUrl && createdUrls.current.has(target.previewUrl)) {
      URL.revokeObjectURL(target.previewUrl);
      createdUrls.current.delete(target.previewUrl);
    }
    setFiles(files.filter((f) => f.id !== id));
  };

  const reset = () => {
    files.forEach((it) => {
      if (createdUrls.current.has(it.previewUrl)) {
        URL.revokeObjectURL(it.previewUrl);
      }
    });
    createdUrls.current.clear();
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const open = () => inputRef.current?.click();

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = Array.from(e.target.files ?? []);
    addFiles(list);
    e.currentTarget.value = "";
  };

  const getInputProps = () => ({
    ref: inputRef as React.RefObject<HTMLInputElement>,
    type: "file",
    multiple: max > 1,
    onChange: onInputChange,
  });

  useEffect(() => {
    return () => {
      createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
      createdUrls.current.clear();
    };
  }, []);

  return {
    files,
    state,
    isEmpty,
    isFull,
    open,
    addFiles,
    removeFile,
    reset,
    getInputProps,
  };
}
