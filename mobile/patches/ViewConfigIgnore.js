/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Patched: removed `const` from type parameter (hermes-parser 0.25.1 compat)
 *
 * @flow strict
 * @format
 */

import Platform from '../Utilities/Platform';

const ignoredViewConfigProps = new WeakSet<{...}>();

export function DynamicallyInjectedByGestureHandler<T: {...}>(object: T): T {
  ignoredViewConfigProps.add(object);
  return object;
}

export function ConditionallyIgnoredEventHandlers<
  T: {+[name: string]: true},
>(value: T): T | void {
  if (Platform.OS === 'ios') {
    return value;
  }
  return undefined;
}

export function isIgnored(value: mixed): boolean {
  if (typeof value === 'object' && value != null) {
    return ignoredViewConfigProps.has(value);
  }
  return false;
}
