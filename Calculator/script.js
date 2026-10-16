/* ================================================
   Calculator – JavaScript Logic
   ================================================
   State variables:
     currentInput  – the number currently being typed
     previousInput – the first operand stored after an operator is pressed
     operator      – the pending arithmetic operator
     shouldResetScreen – flag to clear display on next digit press
                         (used right after = or after choosing an operator)
   ================================================ */

let currentInput = "0";    // What's shown in the main (large) display
let previousInput = "";    // First operand for a binary operation
let operator = null;       // Current pending operator: '+', '−', '×', '÷'
let shouldResetScreen = false; // When true, next digit starts a fresh number

// ── DOM references ──────────────────────────────────────────────────────────
const resultEl     = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const displayEl    = document.querySelector(".display");

// ── updateDisplay ───────────────────────────────────────────────────────────
/**
 * Renders the current state to the display.
 * Adjusts font size dynamically when the number is long.
 */
function updateDisplay() {
  resultEl.textContent = currentInput;

  // Shrink font for very long numbers to prevent overflow
  const len = currentInput.length;
  resultEl.classList.remove("small", "xsmall");
  if (len > 12) resultEl.classList.add("xsmall");
  else if (len > 9) resultEl.classList.add("small");
}

// ── appendNumber ────────────────────────────────────────────────────────────
/**
 * Appends a digit (0-9) to the current input.
 * Prevents leading zeros (e.g. "007" → "7").
 * @param {string} digit – The digit character pressed.
 */
function appendNumber(digit) {
  clearError(); // Remove error styling if present

  // After pressing = or an operator, start fresh
  if (shouldResetScreen) {
    currentInput = digit;
    shouldResetScreen = false;
    updateDisplay();
    return;
  }

  // Don't allow more than 15 digits
  if (currentInput.replace(/[^0-9]/g, "").length >= 15) return;

  // Replace lone "0" with digit (avoid "07"), otherwise append
  if (currentInput === "0") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }

  updateDisplay();
}

// ── appendDecimal ───────────────────────────────────────────────────────────
/**
 * Adds a decimal point to the current number.
 * Prevents duplicate decimals (e.g. "3.1.4" is blocked).
 */
function appendDecimal() {
  clearError();

  // If screen was just reset (e.g. right after =), start "0."
  if (shouldResetScreen) {
    currentInput = "0.";
    shouldResetScreen = false;
    updateDisplay();
    return;
  }

  // Only add "." if one doesn't already exist
  if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  updateDisplay();
}

// ── appendOperator ──────────────────────────────────────────────────────────
/**
 * Stores the current number as the first operand and records the operator.
 * If an operator was already pending and the user hasn't typed a new number,
 * just swap the operator (chaining operators without re-evaluating).
 * If both operands exist, evaluate the previous expression first (chaining).
 * @param {string} op – One of '+', '−', '×', '÷'
 */
function appendOperator(op) {
  clearError();

  // If the previous calculation errored out, don't proceed
  if (currentInput === "Error" || currentInput === "Undefined") return;

  // If user is chaining (e.g. 3 + 5 ×), evaluate the pending expression first
  if (operator && !shouldResetScreen) {
    calculate(true); // silent = true means don't finalise / reset state
  }

  previousInput = currentInput;    // Store current value as first operand
  operator = op;                   // Store the chosen operator
  shouldResetScreen = true;        // Next digit starts the second operand

  // Update the expression bar to show: <number> <op>
  expressionEl.textContent = `${formatExpression(previousInput)} ${op}`;

  // Highlight the active operator button
  highlightOperator(op);
}

// ── calculate ───────────────────────────────────────────────────────────────
/**
 * Performs the arithmetic operation using previousInput, operator,
 * and currentInput. Handles:
 *   - Division by zero → "Undefined"
 *   - Missing operator → no-op
 *   - Floating-point rounding (toFixed precision)
 * @param {boolean} silent – If true, keeps state for chaining (no = finalise).
 */
function calculate(silent = false) {
  // Nothing to compute if operator or previous value is absent
  if (!operator || previousInput === "") return;

  const a = parseFloat(previousInput);  // First operand
  const b = parseFloat(currentInput);   // Second operand
  let result;

  // ── Core arithmetic ──
  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "−":
      result = a - b;
      break;
    case "×":
      result = a * b;
      break;
    case "÷":
      // Guard: division by zero is mathematically undefined
      if (b === 0) {
        showError("Undefined");
        expressionEl.textContent = `${formatExpression(a)} ÷ 0 =`;
        operator = null;
        previousInput = "";
        return;
      }
      result = a / b;
      break;
    default:
      return;
  }

  // ── Fix floating-point drift (e.g. 0.1 + 0.2 = 0.30000000004) ──
  result = parseFloat(result.toPrecision(12));

  if (!silent) {
    // Finalise: show the full expression above the result
    expressionEl.textContent = `${formatExpression(a)} ${operator} ${formatExpression(b)} =`;
    currentInput = String(result);
    operator = null;
    previousInput = "";
    shouldResetScreen = true; // Next digit starts fresh
    clearHighlight();
  } else {
    // Chained operation: update current without clearing operator context
    currentInput = String(result);
  }

  updateDisplay();
}

// ── clearAll ────────────────────────────────────────────────────────────────
/**
 * Resets the calculator to its initial state (like pressing AC).
 * Clears all stored values and display.
 */
function clearAll() {
  currentInput = "0";
  previousInput = "";
  operator = null;
  shouldResetScreen = false;
  expressionEl.textContent = "";
  clearError();
  clearHighlight();
  updateDisplay();
}

// ── toggleSign ──────────────────────────────────────────────────────────────
/**
 * Flips the sign of the current number (+/-).
 * e.g. 5 → -5, -3.2 → 3.2
 */
function toggleSign() {
  if (currentInput === "0" || currentInput === "Error") return;

  currentInput = String(parseFloat(currentInput) * -1);
  updateDisplay();
}

// ── percentage ───────────────────────────────────────────────────────────────
/**
 * Converts the current number to a percentage (divides by 100).
 * Useful for: 50% → 0.5, then use in arithmetic.
 */
function percentage() {
  if (currentInput === "Error") return;

  currentInput = String(parseFloat(currentInput) / 100);
  updateDisplay();
}

// ── showError ────────────────────────────────────────────────────────────────
/**
 * Displays an error message in the result area and applies error styling.
 * @param {string} message – The error text to display (e.g., "Undefined").
 */
function showError(message) {
  currentInput = message;
  resultEl.textContent = message;
  displayEl.classList.add("error");
  shouldResetScreen = true;
}

// ── clearError ───────────────────────────────────────────────────────────────
/**
 * Removes the error CSS class from the display element,
 * restoring normal styling.
 */
function clearError() {
  displayEl.classList.remove("error");
}

// ── highlightOperator ─────────────────────────────────────────────────────────
/**
 * Visually highlights the currently active operator button
 * (white background with orange text) to mimic real calculators.
 * @param {string} op – The operator symbol to highlight.
 */
function highlightOperator(op) {
  // First, clear any existing highlight
  clearHighlight();

  // Find all operator buttons and highlight the matching one
  document.querySelectorAll(".btn-operator").forEach((btn) => {
    if (btn.textContent === op) {
      btn.classList.add("active-op");
    }
  });
}

// ── clearHighlight ────────────────────────────────────────────────────────────
/**
 * Removes the active-operator highlight from all operator buttons.
 */
function clearHighlight() {
  document.querySelectorAll(".btn-operator").forEach((btn) => {
    btn.classList.remove("active-op");
  });
}

// ── formatExpression ──────────────────────────────────────────────────────────
/**
 * Formats a number for display in the expression bar.
 * Limits to a readable length; shows integers without ".0".
 * @param {number|string} val – The value to format.
 * @returns {string} Formatted string.
 */
function formatExpression(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return String(val);
  // Show up to 8 significant digits in the expression bar
  return parseFloat(n.toPrecision(8)).toString();
}

// ── Keyboard Support ──────────────────────────────────────────────────────────
/**
 * Maps physical keyboard keys to calculator actions so power users
 * can operate the calculator without clicking.
 *
 * Key mappings:
 *   0-9          → appendNumber
 *   .            → appendDecimal
 *   + - * /      → appendOperator (mapped to display symbols)
 *   Enter or =   → calculate
 *   Backspace    → delete last character
 *   Escape       → clearAll
 *   %            → percentage
 */
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key >= "0" && key <= "9") {
    appendNumber(key);
  } else if (key === ".") {
    appendDecimal();
  } else if (key === "+") {
    appendOperator("+");
  } else if (key === "-") {
    appendOperator("−");
  } else if (key === "*") {
    appendOperator("×");
  } else if (key === "/") {
    e.preventDefault(); // Prevent browser's quick-find shortcut
    appendOperator("÷");
  } else if (key === "Enter" || key === "=") {
    calculate();
  } else if (key === "Backspace") {
    handleBackspace();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    percentage();
  }
});

// ── handleBackspace ───────────────────────────────────────────────────────────
/**
 * Deletes the last character from the current input.
 * If only one digit remains, resets to "0".
 * No effect on error states.
 */
function handleBackspace() {
  if (currentInput === "Error" || currentInput === "Undefined") {
    clearAll();
    return;
  }
  if (shouldResetScreen) return; // Nothing to delete after =

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
  updateDisplay();
}

// ── Initialise ────────────────────────────────────────────────────────────────
// Render the initial "0" on page load
updateDisplay();
