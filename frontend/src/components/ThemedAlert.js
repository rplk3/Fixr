import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AlertContext = createContext(null);

// Icon + color mapping for alert types
const ALERT_THEMES = {
  success: { icon: "checkmark-circle", bg: "#D1FAE5", accent: "#059669", iconBg: "#059669" },
  error:   { icon: "close-circle",     bg: "#FEE2E2", accent: "#DC2626", iconBg: "#DC2626" },
  warning: { icon: "warning",          bg: "#FEF3C7", accent: "#D97706", iconBg: "#D97706" },
  info:    { icon: "information-circle",bg: "#DBEAFE", accent: "#2563EB", iconBg: "#2563EB" },
  confirm: { icon: "help-circle",      bg: "#F0F7F4", accent: "#135E4B", iconBg: "#135E4B" },
};

export const AlertProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const showAlert = useCallback((title, message, buttons, type) => {
    // Auto-detect type from title if not provided
    let alertType = type;
    if (!alertType) {
      const t = (title || "").toLowerCase();
      if (t.includes("success")) alertType = "success";
      else if (t.includes("error") || t.includes("fail")) alertType = "error";
      else if (t.includes("warning")) alertType = "warning";
      else if (buttons && buttons.length > 1) alertType = "confirm";
      else alertType = "info";
    }
    setConfig({ title, message, buttons, type: alertType });
    setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const dismiss = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      if (callback) callback();
    });
  };

  const theme = ALERT_THEMES[config.type] || ALERT_THEMES.info;
  const hasMultipleButtons = config.buttons && config.buttons.length > 1;
  const cancelBtn = hasMultipleButtons ? config.buttons.find(b => b.style === "cancel" || b.text === "Cancel") : null;
  const actionBtn = hasMultipleButtons
    ? config.buttons.find(b => b.style !== "cancel" && b.text !== "Cancel") || config.buttons[config.buttons.length - 1]
    : (config.buttons && config.buttons[0]) || null;

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[st.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[st.box, { transform: [{ scale: scaleAnim }] }]}>
            {/* Icon Circle */}
            <View style={[st.iconCircle, { backgroundColor: theme.iconBg }]}>  
              <Ionicons name={theme.icon} size={32} color="#fff" />
            </View>

            {/* Title */}
            <Text style={[st.title, { color: theme.accent }]}>{config.title || "Alert"}</Text>

            {/* Message */}
            {config.message ? <Text style={st.message}>{config.message}</Text> : null}

            {/* Buttons */}
            <View style={st.btnRow}>
              {cancelBtn && (
                <TouchableOpacity style={st.cancelBtn} onPress={() => dismiss(cancelBtn.onPress)} activeOpacity={0.7}>
                  <Text style={st.cancelBtnText}>{cancelBtn.text || "Cancel"}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[st.actionBtn, { backgroundColor: theme.iconBg }, cancelBtn && { flex: 1 }]}
                onPress={() => dismiss(actionBtn?.onPress)}
                activeOpacity={0.7}
              >
                <Text style={st.actionBtnText}>
                  {hasMultipleButtons ? (actionBtn?.text || "OK") : (actionBtn?.text || "OK")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useThemedAlert = () => useContext(AlertContext);

// Singleton ref so crossAlert can use it without hooks
let _showAlertFn = null;
export const setGlobalAlertFn = (fn) => { _showAlertFn = fn; };
export const getGlobalAlertFn = () => _showAlertFn;

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    width: Math.min(width - 48, 380),
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
