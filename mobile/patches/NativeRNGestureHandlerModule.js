"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;

var _reactNative = require("react-native");

// Try to get the real native module first. If it's not linked in the binary
// (e.g. development without a full native build), fall back to a no-op shim
// so the app can launch and the UI renders. Gesture recognition won't fire
// for custom gesture handlers, but tap/scroll and navigation still work.
var nativeModule = _reactNative.TurboModuleRegistry.get('RNGestureHandlerModule');

if (!nativeModule) {
  nativeModule = {
    handleSetJSResponder: function() {},
    handleClearJSResponder: function() {},
    createGestureHandler: function() {},
    attachGestureHandler: function() {},
    updateGestureHandler: function() {},
    dropGestureHandler: function() {},
    install: function() { return false; },
    flushOperations: function() {},
  };
}

var _default = exports.default = nativeModule;
