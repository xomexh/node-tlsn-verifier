use std::time::Duration;
use neon::prelude::*;
use tlsn_core::{
    presentation::{Presentation, PresentationOutput},
    signing::VerifyingKey
};

use tls_core::verify::WebPkiVerifier;
use tlsn_server_fixture_certs::CA_CERT_DER;
use tlsn_core::CryptoProvider;
use bincode;  
use hex;     
use chrono::DateTime;

fn verify_presentation(mut cx: FunctionContext) -> JsResult<JsString> {
    let encoded_presentation = cx.argument::<JsString>(0)?.value(&mut cx);

    // Convert Base64 string back to bytes
    let presentation_bytes = match base64::decode(&encoded_presentation) {
        Ok(bytes) => bytes,
        Err(_) => return cx.throw_error("Failed to decode Base64 presentation"),
    };

    let presentation: Presentation = match bincode::deserialize(&presentation_bytes) {
        Ok(p) => p,
        Err(_) => return cx.throw_error("Failed to deserialize presentation"),
    };

    let provider = get_crypto_provider_with_server_fixture();

    let VerifyingKey { alg, data: key_data } = presentation.verifying_key();

    println!(
        "Verifying presentation with {alg} key: {}\n\n**Ask yourself, do you trust this key?**\n",
        hex::encode(key_data)
    );

    let PresentationOutput {
        server_name,
        connection_info,
        transcript,
        ..
    } = match presentation.verify(&provider) {
        Ok(output) => output,
        Err(_) => return cx.throw_error("Verification failed"),
    };

    let time = DateTime::UNIX_EPOCH + Duration::from_secs(connection_info.time);
    let server_name = server_name.unwrap();
    let mut partial_transcript = transcript.unwrap();
    partial_transcript.set_unauthed(b'X');

    let sent = String::from_utf8_lossy(partial_transcript.sent_unsafe());
    let recv = String::from_utf8_lossy(partial_transcript.received_unsafe());

    let result = format!(
        "Verified session with {server_name} at {time}.\nData Sent:\n{}\nData Received:\n{}\n",
        sent, recv
    );

    Ok(cx.string(result))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("verifyPresentation", verify_presentation)?;
    Ok(())
}

pub fn get_crypto_provider_with_server_fixture() -> CryptoProvider {
    // custom root store with server-fixture
    let mut root_store = tls_core::anchors::RootCertStore::empty();
    root_store
        .add(&tls_core::key::Certificate(CA_CERT_DER.to_vec()))
        .unwrap();

    CryptoProvider {
        cert: WebPkiVerifier::new(root_store, None),
        ..Default::default()
    }
}
