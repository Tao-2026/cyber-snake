export const FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyA28Q2XedVs9Hmtk4w-ZXUdi6YxFqyO7iU",
  authDomain: "cybersnake-acc95.firebaseapp.com",
  projectId: "cybersnake-acc95",
  storageBucket: "cybersnake-acc95.firebasestorage.app",
  messagingSenderId: "951637155435",
  appId: "1:951637155435:web:6a6a415d144e00aac9db2e"
});

export const FIREBASE_CONFIGURED = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
].every(key => typeof FIREBASE_CONFIG[key] === "string" && FIREBASE_CONFIG[key].trim().length > 0);
