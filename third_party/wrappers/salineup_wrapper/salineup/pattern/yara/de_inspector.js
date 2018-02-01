/**
 * This file defined callback functions to inspect the evidence log.
 *
 *
 * 1. Function tmsa_evidence_handler
 *
 * The function 'tmsa_evidence_handler' will be called with an array
 * of evidence, say evidence log. Every evidence has some attributes,
 * including 'type', 'content', ...  Belowing table described these
 * attributes.
 *
 * Attribute 'type' indicates the type of the evidence, it's an
 * integer. There are built-in js global constant of each type,
 * prefixed with "ETYPE_", for example ETYPE_URL, ETYPE_HTML, ...
 *
 * You can refer to YaraDecisionEngine.h for the definition of those
 * global type contant.
 *
 * Attribute 'content' holds the raw data of the evidence, it's a
 * string.
 *
 *
 * 2. Function tmsa_decision_push_evidence
 *
 * This function is used to push new evidence to the end of the
 * log. The function prototype looks like:
 *
 *   function tmsa_decision_push_evidence(type, content, is_binary)
 *   {
 *     ...
 *   }
 *
 * The 'type' is whatever type of the evidence you want to push, and
 * the 'content' is the raw data of the evidence. If 'is_binary' is
 * true, hex dump mode will be enabled to show the content in evidence
 * log.
 *
 * 3. Function tmsa_decision_console_log
 *
 * This function is used for debuging, it accept only one string
 * parameter as the message, and the message will printed in tmsa.log
 * as the following format:
 *
 * ================ DECISION CONSOLE LOG =================
 * hello JSEvidenceInspector!
 * =======================================================
 *
 * (Created by Mark Tang, 2014/5/28)
 * 
 */

function tmsa_evidence_handler(evidence_log) {
    tmsa_decision_push_evidence(ETYPE_HTML, '<html></html>', false);
    for (var i = 0; i < evidence_log.length; ++i) {
        tmsa_decision_console_log("Got evidence type: " + evidence_log[i].type);
    }
}
