import { Platform, Alert } from "react-native";

/**
 * Cross-platform alert that works on iOS, Android, AND Web.
 * On native: uses Alert.alert()
 * On web: uses window.confirm() for 2+ buttons, window.alert() for single/no buttons
 */
export const crossAlert = (title, message, buttons) => {
  if (Platform.OS === "web") {
    if (buttons && buttons.length > 1) {
      // Find the action button (non-cancel)
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
