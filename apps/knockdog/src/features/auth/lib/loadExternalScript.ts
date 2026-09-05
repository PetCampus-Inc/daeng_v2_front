const scriptPromises = new Map<string, Promise<void>>();

function loadExternalScript(src: string): Promise<void> {
  const existing = scriptPromises.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document is unavailable'));
      return;
    }

    const alreadyLoaded = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (alreadyLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      scriptPromises.delete(src);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  return promise;
}

export { loadExternalScript };
