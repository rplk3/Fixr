import { Platform, Alert } from "react-native";
import { getGlobalAlertFn } from "../components/ThemedAlert";

/**
 * Cross-platform alert that works on iOS, Android, AND Web.
 * Uses the themed in-app popup when available.
 * Falls back to native alerts / window.alert otherwise.
 */
export const crossAlert = (title, message, buttons) => {
  const showAlert = getGlobalAlertFn();

  // If our themed alert system is available, always use it
  if (showAlert) {
    showAlert(title, message, buttons);
    return;
  }

  // Fallback for before provider is mounted
  if (Platform.OS === "web") {
    if (buttons && buttons.length > 1) {
      const actionBtn = buttons.find((b) => b.style !== "cancel" && b.text !== "Cancel") || buttons[buttons.length - 1];
      const confirmed = window.confirm(`${title}\n\n${message || ""}`);
      if (confirmed && actionBtn?.onPress) {
        actionBtn.onPress();
      }
    } else {
      window.alert(`${title}${message ? "\n\n" + message : ""}`);
      if (buttons && buttons[0]?.onPress) buttons[0].onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
