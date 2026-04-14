#!/usr/bin/env node

/**
 * Fix for Gradle 9 compatibility with foojay-resolver-convention plugin
 * Updates the plugin version from 0.5.0 to 1.0.0 to support Gradle 9
 * (0.5.0 references IBM_SEMERU which was removed in Gradle 9)
 */

const fs = require('fs');
const path = require('path');

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
  console.warn('⚠ Could not apply foojay-resolver-convention fix:', error.message);
  process.exit(0); // Don't fail npm install, just warn
}
