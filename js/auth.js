import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDtIrZTayiDnfN1AvpMFepnMwct4wRud74",
    authDomain: "base-de-dados-auth.firebaseapp.com",
    projectId: "base-de-dados-auth",
    storageBucket: "base-de-dados-auth.appspot.com",
    messagingSenderId: "127602370613",
    appId: "1:127602370613:web:26c81e63b2861f7da6a97c",
    measurementId: "G-N0DQS7Y9R3"
    };

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get Firebase Auth and Firestore instances
const auth = getAuth(app);
const db = getFirestore(app);
const testBtn = document.getElementById("butaoTeste");



function registerUser(emailInput, passwordInput, nameInput, acessInput) {
  if (acessInput === "patapouf") {
    
    createUserWithEmailAndPassword(auth, emailInput, passwordInput)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(`User ${user.uid} registered successfully!`);

        // Add user data to Firestore
        const usersCollection = collection(db, "users");
        const docRef = doc(usersCollection, user.uid);

        

        setDoc(docRef, {
          Nome: nameInput,
          email: emailInput,
          Admin: false, 
          Pontos: 0,
        })
        .then(() => {
          console.log("User data saved to Firestore successfully!");

          // Sign in the user after registration
          signInWithEmailAndPassword(auth, emailInput, passwordInput)
            .then(() => {
              // User is logged in, navigate to a new page
              window.location.href = "menu.html";
            })
            .catch((error) => {
              console.error("Error signing in user:", error);
              // Handle sign-in errors gracefully
            });
        })
        .catch((error) => {
          console.error("Error saving user data:", error);
          // Handle Firestore document creation errors
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error creating user:", errorMessage);
        alert("Ocurreu um erro!" + errorMessage);
      });
  } else {
    alert("Wrong Code,try again!");
  }
}


  
    
function loginUser(emailInput, passwordInput) {
  
    signInWithEmailAndPassword(auth, emailInput, passwordInput)
  .then((userCredential) => {
    // User signed in successfully
    console.log("User signed in:", userCredential.user);
    // Redirect to another page
    window.location.href ="menu.html";
  })
  .catch((error) => {
    // Handle errors
    
    alert("Credenciais Erradas!!");
  });
    
  }
  

  
document.addEventListener("DOMContentLoaded", function() {
    const registerButton = document.getElementById("butaoRegisto");
    if (registerButton) {
      registerButton.addEventListener("click", () => {
        event.preventDefault();
        const emailInput = document.getElementById("emailForm").value;
        const passwordInput = document.getElementById("pswForm").value;
        const nameInput = document.getElementById("nomeForm").value;
        const acessInput = document.getElementById("acesscodeForm").value;
        registerUser(emailInput, passwordInput, nameInput, acessInput);
      });
    } else {
        console.log("No register btn");
    }
  });

  document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
    
            event.preventDefault();
          
            const emailInput = document.getElementById("emailForm");
            const passwordInput = document.getElementById("pswForm");
         
            loginUser(emailInput.value, passwordInput.value);
        
          });
    } else {
      console.log("No login btn");
    }
  });



   
   
  



