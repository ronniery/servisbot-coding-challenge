import { describe, expect,it } from 'vitest';

import { act,renderHook } from '@testing-library/react';

import { useAccordion } from '@/hooks/useAccordion';

describe('useAccordion', () => {
  it('should initialize with null by default', () => {
    const { result } = renderHook(() => useAccordion());
    
    expect(result.current.expandedId).toBeNull();
  });

  it('should initialize with provided id', () => {
    const { result } = renderHook(() => useAccordion('1'));

    expect(result.current.expandedId).toBe('1');
    expect(result.current.isExpanded('1')).toBe(true);
  });

  it('should toggle id', () => {
    const { result } = renderHook(() => useAccordion());

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.expandedId).toBe('1');
    expect(result.current.isExpanded('1')).toBe(true);

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.expandedId).toBeNull();
  });

  it('should switch to new id', () => {
    const { result } = renderHook(() => useAccordion());

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.expandedId).toBe('1');

    act(() => {
      result.current.toggle('2');
    });

    expect(result.current.expandedId).toBe('2');
    expect(result.current.isExpanded('1')).toBe(false);
  });

  it('should reset', () => {
    const { result } = renderHook(() => useAccordion('1'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.expandedId).toBeNull();
  });
});
