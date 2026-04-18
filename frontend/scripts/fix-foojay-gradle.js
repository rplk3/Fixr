#!/usr/bin/env node

/**
 * Post-install script to fix Gradle 9 and Android C++ linking issues
 */

const fs = require('fs');
const path = require('path');

// Fix 1: Update foojay-resolver-convention for Gradle 9 compatibility
const gradlePluginPath = path.join(
  __dirname,
  '../node_modules/@react-native/gradle-plugin/settings.gradle.kts'
);

try {
  if (fs.existsSync(gradlePluginPath)) {
    let content = fs.readFileSync(gradlePluginPath, 'utf8');
    const oldVersion = 'org.gradle.toolchains.foojay-resolver-convention").version("0.5.0"';
    const newVersion = 'org.gradle.toolchains.foojay-resolver-convention").version("1.0.0"';

    if (content.includes(oldVersion)) {
      content = content.replace(oldVersion, newVersion);
      fs.writeFileSync(gradlePluginPath, content, 'utf8');
      console.log('✓ Fixed foojay-resolver-convention version for Gradle 9 compatibility');
    }
  }
} catch (error) {
  console.warn('⚠ Could not applfoojay-resolver-convention fix:', error.message);
}

// Fix 2: Patch react-native-safe-area-context CMakeLists.txt to link c++_shared
const safeAreaCMakePath = path.join(
  __dirname,
  '../node_modules/react-native-safe-area-context/android/src/main/jni/CMakeLists.txt'
);

// Fix 3: Patch react-native-worklets CMakeLists.txt to link c++_shared
const workletsCMakePath = path.join(
  __dirname,
  '../node_modules/react-native-worklets/android/CMakeLists.txt'
);

// Fix 4: Patch react-native-reanimated CMakeLists.txt to link c++_shared
const reanimatedCMakePath = path.join(
  __dirname,
  '../node_modules/react-native-reanimated/android/CMakeLists.txt'
);

try {
  if (fs.existsSync(safeAreaCMakePath)) {
    let content = fs.readFileSync(safeAreaCMakePath, 'utf8');

    // Add c++_shared to both target_link_libraries blocks if not already present
    if (!content.includes('c++_shared')) {
      // Fix both the REACTNATIVE_MERGED_SO and else() branches
      content = content.replace(
        /(\s+reactnative\s+\))/,
        '$1\n          c++_shared'
      );
      content = content.replace(
        /(\s+yoga\s+\))/,
        '$1\n          c++_shared'
      );
      fs.writeFileSync(safeAreaCMakePath, content, 'utf8');
      console.log('✓ Fixed react-native-safe-area-context CMakeLists.txt to link c++_shared');
    }
  }
} catch (error) {
  console.warn('⚠ Could not apply C++ linking fix:', error.message);
}

try {
  if (fs.existsSync(workletsCMakePath)) {
    let content = fs.readFileSync(workletsCMakePath, 'utf8');

    if (!content.includes('worklets android log c++_shared')) {
      content = content.replace(
        'target_link_libraries(worklets android log ReactAndroid::reactnative ReactAndroid::jsi',
        'target_link_libraries(worklets android log c++_shared ReactAndroid::reactnative ReactAndroid::jsi'
      );
      fs.writeFileSync(workletsCMakePath, content, 'utf8');
      console.log('✓ Fixed react-native-worklets CMakeLists.txt to link c++_shared');
    }
  }
} catch (error) {
  console.warn('⚠ Could not apply react-native-worklets linking fix:', error.message);
}

try {
  if (fs.existsSync(reanimatedCMakePath)) {
    let content = fs.readFileSync(reanimatedCMakePath, 'utf8');

    if (!content.includes('reanimated\n  c++_shared')) {
      content = content.replace(
        'target_link_libraries(\n  reanimated\n  log',
        'target_link_libraries(\n  reanimated\n  c++_shared\n  log'
      );
      fs.writeFileSync(reanimatedCMakePath, content, 'utf8');
      console.log('✓ Fixed react-native-reanimated CMakeLists.txt to link c++_shared');
    }
  }
} catch (error) {
  console.warn('⚠ Could not apply react-native-reanimated linking fix:', error.message);
  process.exit(0); // Don't fail npm install
}

// Fix 5: Patch react-native-screens CMakeLists.txt to link c++_shared
const screensCMakePath = path.join(
  __dirname,
  '../node_modules/react-native-screens/android/CMakeLists.txt'
);

try {
  if (fs.existsSync(screensCMakePath)) {
    let content = fs.readFileSync(screensCMakePath, 'utf8');

    if (!content.includes('c++_shared')) {
      // Add c++_shared to both the if(RNS_NEW_ARCH_ENABLED) and else() blocks
      // Pattern 1: New arch block (after fbjni::fbjni, before android)
      content = content.replace(
        /fbjni::fbjni\n\s+android/,
        'fbjni::fbjni\n        c++_shared\n        android'
      );
      // Pattern 2: Non-arch block (after jsi, before android closing paren)
      if (!content.includes('c++_shared')) {
        content = content.replace(
          /\)else\(\)\s+target_link_libraries\(rnscreens\n\s+ReactAndroid::jsi\n\s+android/,
          ')else()\n    target_link_libraries(rnscreens\n        ReactAndroid::jsi\n        c++_shared\n        android'
        );
      }
      fs.writeFileSync(screensCMakePath, content, 'utf8');
      console.log('✓ Fixed react-native-screens CMakeLists.txt to link c++_shared');
    }
  }
} catch (error) {
  console.warn('⚠ Could not apply react-native-screens linking fix:', error.message);
}

