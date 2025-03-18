/* tslint:disable */
/* eslint-disable */
/**
 * Initializes the module.
 */
export function initialize(logging_config: LoggingConfig | null | undefined, thread_count: number): Promise<void>;
/**
 * Builds a presentation.
 */
export function build_presentation(attestation: Attestation, secrets: Secrets, reveal: Reveal): Presentation;
export function web_spawn_start_worker(worker: number): void;
export function web_spawn_recover_spawner(spawner: number): Spawner;
/**
 * Starts the thread spawner on a dedicated worker thread.
 */
export function startSpawner(): Promise<any>;
export interface VerifierConfig {
    max_sent_data: number;
    max_recv_data: number;
}

export interface ProverConfig {
    server_name: string;
    max_sent_data: number;
    max_recv_data_online: number | undefined;
    max_recv_data: number;
    defer_decryption_from_start: boolean | undefined;
}

export interface CrateLogFilter {
    level: LoggingLevel;
    name: string;
}

export interface LoggingConfig {
    level: LoggingLevel | undefined;
    crate_filters: CrateLogFilter[] | undefined;
    span_events: SpanEvent[] | undefined;
}

export type SpanEvent = "New" | "Close" | "Active";

export type LoggingLevel = "Trace" | "Debug" | "Info" | "Warn" | "Error";

export type Body = JsonValue;

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface HttpRequest {
    uri: string;
    method: Method;
    headers: Map<string, number[]>;
    body: Body | undefined;
}

export interface HttpResponse {
    status: number;
    headers: [string, number[]][];
}

export type TlsVersion = "V1_2" | "V1_3";

export interface TranscriptLength {
    sent: number;
    recv: number;
}

export interface ConnectionInfo {
    time: number;
    version: TlsVersion;
    transcript_length: TranscriptLength;
}

export interface Transcript {
    sent: number[];
    recv: number[];
}

export interface PartialTranscript {
    sent: number[];
    sent_authed: { start: number; end: number }[];
    recv: number[];
    recv_authed: { start: number; end: number }[];
}

export interface Commit {
    sent: { start: number; end: number }[];
    recv: { start: number; end: number }[];
}

export interface Reveal {
    sent: { start: number; end: number }[];
    recv: { start: number; end: number }[];
}

export type KeyType = "P256";

export interface PresentationOutput {
    attestation: Attestation;
    server_name: string | undefined;
    connection_info: ConnectionInfo;
    transcript: PartialTranscript | undefined;
}

export interface VerifierOutput {
    server_name: string;
    connection_info: ConnectionInfo;
    transcript: PartialTranscript;
}

export interface VerifyingKey {
    alg: number;
    data: number[];
}

export class Attestation {
  private constructor();
  free(): void;
  verifying_key(): VerifyingKey;
  /**
   * Serializes to a byte array.
   */
  serialize(): Uint8Array;
  /**
   * Deserializes from a byte array.
   */
  static deserialize(bytes: Uint8Array): Attestation;
}
export class NotarizationOutput {
  private constructor();
  free(): void;
  attestation: Attestation;
  secrets: Secrets;
}
export class Presentation {
  private constructor();
  free(): void;
  /**
   * Returns the verifying key.
   */
  verifying_key(): VerifyingKey;
  /**
   * Verifies the presentation.
   */
  verify(): PresentationOutput;
  serialize(): Uint8Array;
  static deserialize(bytes: Uint8Array): Presentation;
}
export class Prover {
  free(): void;
  constructor(config: ProverConfig);
  /**
   * Set up the prover.
   *
   * This performs all MPC setup prior to establishing the connection to the
   * application server.
   */
  setup(verifier_url: string): Promise<void>;
  /**
   * Send the HTTP request to the server.
   */
  send_request(ws_proxy_url: string, request: HttpRequest): Promise<HttpResponse>;
  /**
   * Returns the transcript.
   */
  transcript(): Transcript;
  /**
   * Runs the notarization protocol.
   */
  notarize(commit: Commit): Promise<NotarizationOutput>;
  /**
   * Reveals data to the verifier and finalizes the protocol.
   */
  reveal(reveal: Reveal): Promise<void>;
}
export class Secrets {
  private constructor();
  free(): void;
  /**
   * Returns the transcript.
   */
  transcript(): Transcript;
  /**
   * Serializes to a byte array.
   */
  serialize(): Uint8Array;
  /**
   * Deserializes from a byte array.
   */
  static deserialize(bytes: Uint8Array): Secrets;
}
/**
 * Global spawner which spawns closures into web workers.
 */
export class Spawner {
  private constructor();
  free(): void;
  intoRaw(): number;
  /**
   * Runs the spawner.
   */
  run(url: string): Promise<void>;
}
export class Verifier {
  free(): void;
  constructor(config: VerifierConfig);
  /**
   * Connect to the prover.
   */
  connect(prover_url: string): Promise<void>;
  /**
   * Verifies the connection and finalizes the protocol.
   */
  verify(): Promise<VerifierOutput>;
}
export class WorkerData {
  private constructor();
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly __wbg_prover_free: (a: number, b: number) => void;
  readonly prover_new: (a: any) => number;
  readonly prover_setup: (a: number, b: number, c: number) => any;
  readonly prover_send_request: (a: number, b: number, c: number, d: any) => any;
  readonly prover_transcript: (a: number) => [number, number, number];
  readonly prover_notarize: (a: number, b: any) => any;
  readonly prover_reveal: (a: number, b: any) => any;
  readonly __wbg_verifier_free: (a: number, b: number) => void;
  readonly verifier_new: (a: any) => number;
  readonly verifier_connect: (a: number, b: number, c: number) => any;
  readonly verifier_verify: (a: number) => any;
  readonly initialize: (a: number, b: number) => any;
  readonly build_presentation: (a: number, b: number, c: any) => [number, number, number];
  readonly __wbg_attestation_free: (a: number, b: number) => void;
  readonly attestation_verifying_key: (a: number) => any;
  readonly attestation_serialize: (a: number) => [number, number];
  readonly attestation_deserialize: (a: number, b: number) => [number, number, number];
  readonly __wbg_secrets_free: (a: number, b: number) => void;
  readonly secrets_transcript: (a: number) => any;
  readonly secrets_serialize: (a: number) => [number, number];
  readonly secrets_deserialize: (a: number, b: number) => [number, number, number];
  readonly __wbg_presentation_free: (a: number, b: number) => void;
  readonly presentation_verifying_key: (a: number) => any;
  readonly presentation_verify: (a: number) => [number, number, number];
  readonly presentation_serialize: (a: number) => [number, number];
  readonly presentation_deserialize: (a: number, b: number) => [number, number, number];
  readonly __wbg_notarizationoutput_free: (a: number, b: number) => void;
  readonly __wbg_get_notarizationoutput_attestation: (a: number) => number;
  readonly __wbg_set_notarizationoutput_attestation: (a: number, b: number) => void;
  readonly __wbg_get_notarizationoutput_secrets: (a: number) => number;
  readonly __wbg_set_notarizationoutput_secrets: (a: number, b: number) => void;
  readonly __wbg_workerdata_free: (a: number, b: number) => void;
  readonly web_spawn_start_worker: (a: number) => void;
  readonly __wbg_spawner_free: (a: number, b: number) => void;
  readonly spawner_intoRaw: (a: number) => number;
  readonly spawner_run: (a: number, b: number, c: number) => any;
  readonly web_spawn_recover_spawner: (a: number) => number;
  readonly startSpawner: () => any;
  readonly ring_core_0_17_13__bn_mul_mont: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_5: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_7: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly closure921_externref_shim: (a: number, b: number, c: any) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__heab2ba05d1a05fda: (a: number, b: number) => void;
  readonly closure3892_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure4533_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number, c?: number) => void;
  readonly __wbindgen_start: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number }} module - Passing `SyncInitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number } | SyncInitInput, memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number }} module_or_path - Passing `InitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number } | InitInput | Promise<InitInput>, memory?: WebAssembly.Memory): Promise<InitOutput>;
