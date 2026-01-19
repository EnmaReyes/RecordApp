import { useState, useRef } from "react";

export function calcSpread(sell, buy) {
  if (!buy || !sell || sell === 0) return 0;
  const spread = ((buy - sell) / buy) * 100;
  return spread;
}

const formatThousands = (value) => {
  if (!value) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
};
const stripNonNumeric = (value) => value.replace(/[^\d]/g, "");

export const useThousandsInput = () => {
  const [rawValue, setRawValue] = useState("");
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const input = e.target;
    const caretPosition = input.selectionStart;

    const prevFormatted = input.value;
    const numeric = stripNonNumeric(prevFormatted);

    const formatted = formatThousands(numeric);

    // diferencia de longitud para ajustar caret
    const diff = formatted.length - prevFormatted.length;

    setRawValue(numeric);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(
          caretPosition + diff,
          caretPosition + diff,
        );
      }
    });
  };

  return {
    ref: inputRef,
    value: formatThousands(rawValue),
    rawValue,
    onChange: handleChange,
  };
};
