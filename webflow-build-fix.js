#!/usr/bin/env node

/**
 * Webflow Cloud Build Fix
 * 
 * This script is a workaround for the Webflow Cloud build issue where
 * their template tries to assign to a read-only 'images' property.
 * 
 * If Webflow continues to fail, this script can be used as a pre-build
 * step to ensure the configuration is mutable.
 */

const fs = require('fs');
const path = require('path');

// Check if we're in Webflow's build environment
if (process.env.COSMIC_MOUNT_PATH) {
  console.log('Detected Webflow Cloud environment, applying build fixes...');
  
  // If there's a next.config.compiled.js, try to fix it
  const compiledConfigPath = path.join(process.cwd(), 'next.config.compiled.js');
  if (fs.existsSync(compiledConfigPath)) {
    console.log('Found next.config.compiled.js, attempting to fix...');
    
    try {
      let content = fs.readFileSync(compiledConfigPath, 'utf8');
      
      // Replace any Object.freeze or Object.seal calls
      content = content.replace(/Object\.freeze\(/g, '(');
      content = content.replace(/Object\.seal\(/g, '(');
      
      // Try to make the images property writable
      content = content.replace(
        /images:\s*{/g,
        'images: Object.assign({}, {'
      );
      
      fs.writeFileSync(compiledConfigPath, content);
      console.log('Applied fixes to next.config.compiled.js');
    } catch (error) {
      console.error('Failed to fix next.config.compiled.js:', error);
    }
  }
  
  // Ensure our config is mutable
  const configPath = path.join(process.cwd(), 'next.config.js');
  if (!fs.existsSync(configPath)) {
    // Create a minimal mutable config
    const minimalConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},
};

// Ensure the config is mutable
if (typeof nextConfig.images === 'object') {
  Object.defineProperty(nextConfig, 'images', {
    value: nextConfig.images || {},
    writable: true,
    enumerable: true,
    configurable: true
  });
}

module.exports = nextConfig;
`;
    fs.writeFileSync(configPath, minimalConfig);
    console.log('Created mutable next.config.js');
  }
}

console.log('Build fix script completed');
