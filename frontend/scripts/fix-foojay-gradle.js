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
  process.exit(0); // Don't fail npm install
}

