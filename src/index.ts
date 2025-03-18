// Polyfill for `self` in Node.js
if (typeof self === "undefined") {
  (globalThis as any).self = globalThis;
}

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

import { secp256k1 } from '@noble/curves/secp256k1';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';

import attestationJson from "../src/fixtures/json/attestation.json"

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

import { createRequire } from "node:module"
const neonVerifier = createRequire(import.meta.url)('../neon-verifier/index.node');

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

    console.log("\nAttestation sub-array:\n", attestation.serialize().subarray(72))

    console.log("\nVerifying Key:\n", presentationCheck.verifying_key())

    const commit: Commit = {
        sent: [{ start: 0, end: secrets.transcript().sent.length }],
        recv: [{ start: 0, end: secrets.transcript().recv.length }],
    };

    const presentation = build_presentation(attestation, secrets, commit);

    console.log("\nPresntation: built using WASM Attestation & Secrets:\n", presentation.serialize());
    console.log("\nPresntation: built using TLSNv8 Attestation & Secrets:\n", presentationCheck.serialize());

    
    //Both are same. 
    const checkSimilarity = await areUint8ArraysEqual(presentationCheck.serialize(), presentationCheck.serialize());
    console.log(`\nAre both presntations same? ${checkSimilarity?`Yes`:`No`}`)

    //Neon-verifier
    // console.log(Buffer.from(presentation.serialize()).toString("base64"));
    const check = neonVerifier.verifyPresentation(Buffer.from(presentation.serialize()).toString("base64"))
    // const check = neonVerifier.verifyPresentation(Buffer.from(new Uint8Array([1, 3, 5])).toString("base64")) -> Check how exception is handled.
    console.log(check);

    // const result = await presentation.verify() //ERROR HERE! -> Error: presentation error: server identity error caused by: server identity proof error: certificate: invalid server certificate
    // console.log("\nCheck Verification:\n", result);
    // console.log("\nCheck Verification:\n", presentationCheck.verify());
}

async function experiments(){
    const public_key_notary = hexToBytes('037b48f19c139b6888fb5e383a4d72c2335186fd5858e7ae743ab4bf8e071b06e7');
    const messageActual = new Uint8Array([
        149, //header["id"] start
        114,
        191,
        186,
        214,
        245,
        84,
        0,
        127,
        97,
        192,
        239,
        226,
        140,
        107,
        180, //header["id"] end
        0,0,0,0, //Maybe since BCS stores in LE encoding of header["version"]? 
        2, //header["root"]["alg"] 
        32, //Most likely indicating size of root.value as it is dynamically sized.
        226, //header["root"]["value"] START
        74,
        16,
        184,
        72,
        10,
        91,
        56,
        87,
        110,
        29,
        245,
        138,
        42,
        83,
        100,
        192,
        136,
        151,
        115,
        43,
        233,
        62,
        69,
        236,
        113,
        115,
        135,
        149,
        134,
        39,
        83  //header["root"]["value"] END
    ]);
    const signatureByteArray = new Uint8Array([
        62,
        109,
        107,
        136,
        89,
        241,
        255,
        225,
        68,
        128,
        246,
        83,
        44,
        121,
        13,
        129,
        51,
        133,
        52,
        209,
        254,
        14,
        95,
        207,
        93,
        214,
        236,
        71,
        233,
        164,
        54,
        62,
        47,
        203,
        226,
        235,
        32,
        156,
        180,
        187,
        121,
        114,
        239,
        12,
        59,
        66,
        206,
        55,
        129,
        204,
        71,
        204,
        99,
        72,
        137,
        158,
        220,
        240,
        5,
        160,
        57,
        194,
        219,
        173
    ]);
    const signatureActual = secp256k1.Signature.fromCompact(bytesToHex(signatureByteArray))

    console.log("Signature:\n",signatureActual.toCompactHex());
    console.log("Message:\n",messageActual);

    const result = secp256k1.verify(
        signatureActual,
        messageActual, 
        public_key_notary, 
        {prehash:true})
    console.log(`ECDSA Signature valid? ${result?`Yes`:`No`}`);
}

main().catch(console.error);
experiments()

async function areUint8ArraysEqual(arr1: Uint8Array, arr2: Uint8Array): Promise<boolean> {
  if (arr1.length !== arr2.length) {
      return false;
  }

  for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
          return false;
      }
  }

  return true;
}
