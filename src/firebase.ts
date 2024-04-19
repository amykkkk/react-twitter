import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzVzmdf4cOaQtJf54pDli251lwOllgx9Q",
  authDomain: "nwitter-reloaded-6392c.firebaseapp.com",
  projectId: "nwitter-reloaded-6392c",
  storageBucket: "nwitter-reloaded-6392c.appspot.com",
  messagingSenderId: "263218381050",
  appId: "1:263218381050:web:0f246c2b52ed959965c943",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
