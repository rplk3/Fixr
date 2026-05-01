import React from "react";
import { Platform } from "react-native";

/**
 * Web-only native HTML date input.
 * On native platforms this returns null (should not be rendered).
 */
export const WebDateInput = ({ value, min, onChange, style }) => {
  if (Platform.OS !== "web") return null;

  return React.createElement("input", {
    type: "date",
    value: value || "",
    min: min || "",
    onChange: (e) => onChange(e.target.value),
    style: {
      width: "100%",
      padding: 14,
      fontSize: 15,
      borderRadius: 12,
      border: "1px solid #E0E0E0",
      backgroundColor: "#fff",
      color: "#000",
      boxSizing: "border-box",
      fontFamily: "inherit",
      marginBottom: 14,
      outline: "none",
      cursor: "pointer",
      ...style,
    },
  });
};

/**
 * Web-only native HTML time input.
 * On native platforms this returns null (should not be rendered).
 */
export const WebTimeInput = ({ value, onChange, style }) => {
  if (Platform.OS !== "web") return null;

  return React.createElement("input", {
    type: "time",
    value: value || "",
    onChange: (e) => onChange(e.target.value),
    style: {
      width: "100%",
      padding: 14,
      fontSize: 15,
      borderRadius: 12,
      border: "1px solid #E0E0E0",
      backgroundColor: "#fff",
      color: "#000",
      boxSizing: "border-box",
      fontFamily: "inherit",
      marginBottom: 14,
      outline: "none",
      cursor: "pointer",
      ...style,
    },
  });
};
