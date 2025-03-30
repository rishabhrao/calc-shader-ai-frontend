mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn evaluate_rs(expression: String) -> Result<String, wasm_bindgen::JsError> {
    utils::set_panic_hook();

    let eval_result = meval::eval_str(&expression)?;

    Ok(eval_result.to_string())
}
