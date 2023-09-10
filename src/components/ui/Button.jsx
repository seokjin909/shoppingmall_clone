import React from "react";

export default function Button({ text, onClick, disabled }) {
  return (
    <button className="bg-brand py-2 px-4 text-white rounded-sm hover:brightness-110" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
