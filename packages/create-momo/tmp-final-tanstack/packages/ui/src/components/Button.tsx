import React from "react";

export const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "0.25rem",
        backgroundColor: "#f3f4f6",
        border: "1px solid #d1d5db",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
};
