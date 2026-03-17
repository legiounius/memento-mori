/**
 * Patched version of VirtualView.js — replaces Hermes-only syntax
 * (component, enum, match) with standard JavaScript for Metro/Babel compatibility.
 */

import * as React from 'react';
import { View } from 'react-native';

export const VirtualViewMode = Object.freeze({
  Visible: 0,
  Prerender: 1,
  Hidden: 2,
});

export const VirtualViewRenderState = Object.freeze({
  Unknown: 0,
  Rendered: 1,
  None: 2,
});

function createVirtualView(_initialState) {
  function VirtualView({ children, nativeID, style }) {
    return React.createElement(View, { nativeID, style }, children);
  }
  return VirtualView;
}

export default createVirtualView(null);

export function createHiddenVirtualView(_height) {
  return createVirtualView(_height);
}

export const _logs = {};
