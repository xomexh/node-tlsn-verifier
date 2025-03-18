// Polyfill for `self` in Node.js
if (typeof self === "undefined") {
  (globalThis as any).self = globalThis;
}

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

import initWasm, {
    Attestation as WasmAttestation,
    Secrets as WasmSecrets,
    type Commit,
    type Reveal,
    Verifier as WasmVerifier,
    Prover as WasmProver,
    Presentation as WasmPresentation,
    build_presentation,
} from "../wasm/pkg";

async function main() {
    const wasmPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../wasm/pkg/tlsn_wasm_bg.wasm");
    // Read the WASM file manually as Node.js doesn't support fetch for local files
    const wasmBuffer = fs.readFileSync(wasmPath);

    // Initialize the WASM module with the buffer
    await initWasm(wasmBuffer);
    console.log("WASM module initialized");

    const attestationBytes = fs.readFileSync("./src/fixtures/example-json.attestation.tlsn"); // Buffer
    const secretsBytes = fs.readFileSync("./src/fixtures/example-json.secrets.tlsn"); // Buffer
    const presentationBytes = fs.readFileSync("./src/fixtures/example-json.presentation.tlsn") //Buffer

    const attestation = WasmAttestation.deserialize((attestationBytes));
    const secrets = WasmSecrets.deserialize((secretsBytes));
    const presentationCheck = WasmPresentation.deserialize((presentationBytes));

    console.log("Secrets:\n", secrets.serialize())
    console.log("\nAttestation:\n", attestation.serialize())

    console.log("\nVerifying Key:\n", presentationCheck.verifying_key())

    const commit: Commit = {
        sent: [{ start: 0, end: secrets.transcript().sent.length }],
        recv: [{ start: 0, end: secrets.transcript().recv.length }],
    };

    const presentation = build_presentation(attestation, secrets, commit);

    console.log("\nPresntation: built using WASM Attestation & Secrets:\n", presentation.serialize());
    console.log("\nPresntation: built using TLSNv8 Attestation & Secrets:\n", presentation.serialize());
    //Both are same. 

    const result = await presentation.verify() //ERROR HERE! -> Error: presentation error: server identity error caused by: server identity proof error: certificate: invalid server certificate
    console.log("Check Verification:\n", result);
    console.log("Check Verification:\n", presentationCheck.verify());
}

main().catch(console.error);