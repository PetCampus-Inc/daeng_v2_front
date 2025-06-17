import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { dataAttr } from '@daeng-design/utils';
import { useState, useCallback, useRef, useEffect, useId } from 'react';
import * as dom from './dom';

interface IndicatorRect {
  left: string;
  top: string;
  width: string;
  height: string;
}

interface UseSegmentedControlStateProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function useSegmentedControlState(props: UseSegmentedControlStateProps) {
  const [value, setValue] = useControllableState({
    prop: props.value,
    onChange: props.onValueChange,
    defaultProp: props.defaultValue ?? '',
  });
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const [canIndicatorTransition, setIndicatorTransition] = useState(false);
  const [indicatorRect, setIndicatorRect] = useState<Partial<IndicatorRect>>(
    {}
  );
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  const indicatorObserverRef = useRef<() => void>(null);

  const cleanupObserver = useCallback(() => {
    if (indicatorObserverRef.current) {
      indicatorObserverRef.current();
      indicatorObserverRef.current = null;
    }
  }, []);

  const syncIndicatorRect = useCallback(() => {
    cleanupObserver();
    if (!rootEl) return;

    const selectedEl = dom.getItemElement(rootEl, value);

    if (value == null || !selectedEl) {
      setIndicatorTransition(false);
      setIndicatorRect({});
      return;
    }

    const indicatorCleanup = dom.trackElementRect(selectedEl, (rect) => {
      setIndicatorRect(dom.resolveRect(rect));
    });

    indicatorObserverRef.current = indicatorCleanup;

    // 초기 상태에서는 트랜지션 없이 적용, 이후 트랜지션 활성화
    setTimeout(() => {
      setIndicatorTransition(true);
    }, 0);

    return indicatorCleanup;
  }, [value, rootEl]);

  useEffect(() => {
    setIndicatorTransition(Boolean(value));
    syncIndicatorRect();
  }, [value, syncIndicatorRect]);

  useEffect(() => {
    return () => cleanupObserver();
  }, [cleanupObserver]);

  useEffect(() => {
    return () => {
      cleanupObserver();
    };
  }, [cleanupObserver]);

  return {
    value,
    setValue,
    hoveredValue,
    setHoveredValue,
    activeValue,
    setActiveValue,
    focusedValue,
    setFocusedValue,
    setRootEl,
    indicatorRect,
    canIndicatorTransition,
  };
}

interface UseSegmentedControlProps extends UseSegmentedControlStateProps {
  disabled?: boolean;
  name?: string;
  form?: string;
}

interface UseSegmentedControlItemProps {
  value: string;
  disabled?: boolean;
}

type UseSegmentedControlReturn = ReturnType<typeof useSegmentedControl>;

function useSegmentedControl(props: UseSegmentedControlProps) {
  const {
    value,
    setValue,
    hoveredValue,
    setHoveredValue,
    activeValue,
    setActiveValue,
    focusedValue,
    setFocusedValue,
    setRootEl,
    indicatorRect,
    canIndicatorTransition,
  } = useSegmentedControlState(props);

  const { disabled, name, form } = props;

  const id = useId();

  const getItemState = useCallback(
    (itemProps: UseSegmentedControlItemProps) => {
      return {
        disabled: !!itemProps.disabled,
        checked: value === itemProps.value,
        focused: focusedValue === itemProps.value,
        hovered: hoveredValue === itemProps.value,
        active: activeValue === itemProps.value,
      };
    },
    [value, focusedValue, hoveredValue, activeValue, disabled]
  );

  return {
    value,
    setValue,
    refs: {
      root: setRootEl,
    },

    getRootProps() {
      return {
        role: 'group',
        'data-disabled': dataAttr(disabled),
      };
    },

    getItemProps(itemProps: UseSegmentedControlItemProps) {
      const itemState = getItemState(itemProps);

      const itemDataAttrs = {
        'data-focus': dataAttr(itemState.focused),
        'data-disabled': dataAttr(itemState.disabled),
        'data-state': itemState.checked ? 'checked' : 'unchecked',
        'data-active': dataAttr(itemState.active),
        'data-value': itemProps.value,
      };

      return {
        ...itemDataAttrs,
        onPointerMove() {
          if (itemState.disabled) return;
          setHoveredValue(itemProps.value);
        },
        onPointerLeave() {
          if (itemState.disabled) return;
          setHoveredValue(null);
          setActiveValue(null);
        },
        onPointerDown(event: React.PointerEvent) {
          if (itemState.disabled) return;
          if (itemState.focused && event.pointerType === 'mouse') {
            event.preventDefault();
          }
          setActiveValue(itemProps.value);
        },
        onPointerUp() {
          if (itemState.disabled) return;
          setActiveValue(null);
        },
      };
    },

    getItemHiddenInputProps(itemProps: UseSegmentedControlItemProps) {
      const itemState = getItemState(itemProps);

      return {
        type: 'radio',
        name: name || id,
        form,
        value: itemProps.value,

        onChange(event: React.ChangeEvent<HTMLInputElement>) {
          if (itemState.disabled) return;

          if (event.target.checked) {
            setValue(itemProps.value);
          }
        },
        onBlur() {
          setFocusedValue(null);
        },
        onFocus() {
          setFocusedValue(itemProps.value);
        },
        onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
          if (event.defaultPrevented) return;
          if (event.key === ' ') {
            setActiveValue(itemProps.value);
          }
        },
        onKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
          if (event.defaultPrevented) return;
          if (event.key === ' ') {
            setActiveValue(null);
          }
        },
        disabled: itemState.disabled,
        defaultChecked: itemState.checked,
        style: dom.visuallyHiddenStyle,
      };
    },

    getIndicatorProps() {
      return {
        hidden: value == null,
        style: {
          '--left': indicatorRect?.left,
          '--top': indicatorRect?.top,
          '--width': indicatorRect?.width,
          '--height': indicatorRect?.height,
          position: 'absolute',
          transitionProperty: 'left, top, width, height',
          transitionDuration: canIndicatorTransition ? '200ms' : '0ms',
          pointerEvents: 'none',
          left: 'var(--left)',
        } as React.CSSProperties,
      };
    },
  };
}

export {
  useSegmentedControl,
  type UseSegmentedControlProps,
  type UseSegmentedControlItemProps,
  type UseSegmentedControlReturn,
};
