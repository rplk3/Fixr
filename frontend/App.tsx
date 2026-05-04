import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AlertProvider, useThemedAlert, setGlobalAlertFn } from "./src/components/ThemedAlert";

const AlertRegistrar = ({ children }) => {
  const showAlert = useThemedAlert();
  React.useEffect(() => { setGlobalAlertFn(showAlert); }, [showAlert]);
  return children;
};

function App(): React.JSX.Element {
  return (
    <AlertProvider>
      <AlertRegistrar>
        <AppNavigator />
      </AlertRegistrar>
    </AlertProvider>
  );
}

export default App;