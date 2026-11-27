// Older WebViews lack the Object.hasOwn API used by Ky.
if (typeof Object.hasOwn !== 'function') {
  Object.defineProperty(Object, 'hasOwn', {
    configurable: true,
    writable: true,
    value: (object: object, property: PropertyKey) => Object.prototype.hasOwnProperty.call(object, property),
  });
}
