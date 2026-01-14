// Business module index - dev environment
// This file serves as the entry point for business-specific functionality

export default function businessModule(context, message) {
  // Business module entry point that accepts context and message
  // This is the expected signature based on the error in background.bundle.js

  console.log('Business module initialized for context:', context);

  // Return the business module object for backward compatibility
  return {
    name: 'Business Module',
    version: '1.0.0',
    environment: 'development',
    context,
    message,
  };
}
