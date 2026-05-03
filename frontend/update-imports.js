const fs = require('fs');
const path = require('path');

const dir = 'f:/Documents/Y2S2 - IT/WMT/Fixr/frontend/src/screens';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";')) {
      content = content.replace(
        'import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";',
        'import KeyboardAwareScrollView from "../components/KeyboardAwareScrollView";'
      );
      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated ' + file);
    }
  }
});
