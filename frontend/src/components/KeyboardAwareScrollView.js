import React from "react";
import { Platform, ScrollView } from "react-native";
import { KeyboardAwareScrollView as NativeKeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const KeyboardAwareScrollView = React.forwardRef((props, ref) => {
  if (Platform.OS === "web") {
    // Web doesn't need KeyboardAwareScrollView, standard ScrollView is sufficient
    // and avoids the crash/white screen issues.
    return <ScrollView ref={ref} {...props} />;
  }

  return <NativeKeyboardAwareScrollView ref={ref} {...props} />;
});

export default KeyboardAwareScrollView;
