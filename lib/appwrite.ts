// Import necessary modules and libraries
import { Platform } from "react-native";
import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

// Configuration for Appwrite client
export const config = {
  platform: "com.tejiri.restate", // Platform identifier for the app
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT, // Appwrite server endpoint
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID, // Appwrite project ID
};

// Initialize the Appwrite client
export const client = new Client();

client
  .setEndpoint(config.endpoint!) // Set the Appwrite server endpoint
  .setProject(config.projectId!) // Set the Appwrite project ID
  .setPlatform(config.platform!); // Set the platform identifier

// Initialize Appwrite services
export const avatar = new Avatars(client); // Service for handling avatars
export const account = new Account(client); // Service for handling user accounts

// Function to log in the user using Google OAuth
export async function login() {
  try {
    // Create a redirect URI for deep linking
    const redirectUri = Linking.createURL("/");

    // Initiate the OAuth login process
    const response = account.createOAuth2Token(
      OAuthProvider.Google, // Specify Google as the OAuth provider
      redirectUri // Redirect URI for handling the callback
    );
    if (!response) throw new Error("Failed to login");

    // Open the OAuth login page in the browser
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    // Check if the login was successful
    if (browserResult.type !== "success") throw new Error("Failed to Login");

    // Parse the redirect URL to extract query parameters
    const url = new URL(browserResult.url);

    const secret = url.searchParams.get("secret")?.toString(); // Extract the secret
    const userId = url.searchParams.get("userId")?.toString(); // Extract the user ID

    // Ensure both secret and userId are present
    if (!secret || !userId) throw new Error("Failed to Login");

    // Create a session using the extracted secret and userId
    const session = await account.createSession(userId, secret);

    // Ensure the session was created successfully
    if (!session) throw new Error("Failed to create a session");

    return true; // Return true if login was successful
  } catch (error) {
    console.log(error); // Log any errors
    return false; // Return false if login failed
  }
}

// Function to log out the currently logged-in user
export async function logout() {
  try {
    // Delete the current session
    await account.deleteSession("current");
    return true; // Return true if logout was successful
  } catch (error) {
    console.log(error); // Log any errors
    return false; // Return false if logout failed
  }
}

// Function to retrieve the currently logged-in user's details
export async function getCurrentUser() {
  try {
    // Fetch the user's account details
    const response = await account.get();

    // If the user is logged in, generate an avatar and return user details
    if (response.$id) {
      const userAvatar = avatar.getInitials(response.name); // Generate avatar based on user's name
      return { ...response, avatar: userAvatar.toString() }; // Return user details with avatar
    }

    return response; // Return the raw response if no user is logged in
  } catch (error) {
    console.log(error); // Log any errors
    return null; // Return null if fetching user details failed
  }
}
