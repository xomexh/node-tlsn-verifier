# Modify `spwan.js`

Replace `target.addEventListener('message', listener);` with 
```
if (typeof target.addEventListener === "function") {
        target.addEventListener('message', listener);
      } else if (typeof target.on === "function") {
        target.on('message', (event) => listener(event.data));
      }
```

# Polyfill for `self` in Node.js

Add polyfill for the self browser object, before importing wasm modules.
```
if (typeof self === "undefined") {
  (globalThis as any).self = globalThis;
}
```

# Load ployfill first then npx

Run the `index.ts` properly with `NODE_OPTIONS="--require ./src/polyfill.js" npx tsx src/index.ts`.

# Current Error

```log
Error: presentation error: server identity error caused by: server identity proof error: certificate: invalid server certificate
    at imports.wbg.__wbindgen_error_new (/Users/soms/ZKON Research/tlsn-ts-verifier/wasm/pkg/tlsn_wasm.js:1246:21)
    at wasm://wasm/0258be82:wasm-function[5453]:0x414b5b
    at wasm://wasm/0258be82:wasm-function[5151]:0x40c8b8
    at Presentation.verify (/Users/soms/ZKON Research/tlsn-ts-verifier/wasm/pkg/tlsn_wasm.js:446:26)
    at main (/Users/soms/ZKON Research/tlsn-ts-verifier/src/index.ts:54:39)
```

Reply from TLSN Team:

```log
The WASM API currently does not support updating its certificate store. It uses Mozilla root certificates by default. The examples use a test server with a self-signed certificate, so it won't work when testing with the WASM build.
```

# WIP: Neon project to verify a presentation.

# Experiments how the Attestation/Presentation signature can be verified.

