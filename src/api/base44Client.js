import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "692b2aa9f3f6b84b38b532a7", 
  requiresAuth: true // Ensure authentication is required for all operations
});
