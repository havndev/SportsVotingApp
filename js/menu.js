import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc ,getDocs, getDoc, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
    
   
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

    // Get Firestore instance
    const db = getFirestore(app);

    const userInfoElement = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutButton');
    const loginBtn = document.getElementById('loginButton');

    

    logoutBtn.addEventListener("click", () => {

    handleLogout();

    alert("logout bem sucedido!");

  });

  loginBtn.addEventListener("click", () => {

    window.location.href = 'login.html';


  });

    // Function to display user info and handle logout
    function displayUserInfo(user) {
      const userInfoElement = document.getElementById('userInfo');

      if (user) {
        // If user is logged in, display their email
        userInfoElement.textContent = `Logged in as: ${user.email}`;

        // Show the logout button
        document.getElementById('logoutButton').style.display = 'block';
        document.getElementById('loginButton').style.display = 'none';
      } else {
        // If user is not logged in, display a message
        userInfoElement.textContent = 'User is not logged in.';

        // Hide the logout button
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('loginButton').style.display = 'block';
      }
    }

    // Function to handle logout
    function handleLogout() {
      signOut(auth)
        .then(() => {
          console.log('User signed out successfully.');
          // Redirect to index.html after logout
          window.location.href = 'index.html';
        })
        .catch((error) => {
          console.error('Error signing out:', error.message);
        });
    }

    // Listen for authentication state changes
    const auth = getAuth(app);

// Function to check admin status
function checkAdminStatus(user) {
  
  const userId = user.uid;
  const userRef = doc(db, 'users', userId);
  getDoc(userRef).then((docSnapshot) => {
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      const isAdmin = userData.Admin;
      if (isAdmin) {
        
        window.localStorage.clear(); //try this to clear all local storage
        // Show the "Create Game" button and form
        
        document.getElementById('createGameButton').style.display = 'block';
        document.getElementById('createDiv').style.display = 'block';
      } else {
        // Hide the "Create Game" button
        document.getElementById('createGameButton').style.display = 'none';
      }
    } else {
      console.log("User document does not exist");
    }
  }).catch((error) => {
    console.error("Error getting user data:", error);
  });
}




// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  displayUserInfo(user); // Display user info first
  checkAdminStatus(user); // Then check admin status
});


// Event listener for the "Create Game" button
document.getElementById('createGameButton').addEventListener('click', () => {
  // Handle the creation of a new game document in Firestore
  // You can implement this based on your application's logic
});

// Reference to the games collection
const gamesRef = collection(db, 'games');

// Function to create a game item with dropdown and button
function createGameItem(team1, team2, gameId) {
  const gameContainer = document.createElement("div");
  gameContainer.classList.add("game-container");

  // Display game information
  const gameInfo = document.createElement("p");
  gameInfo.textContent = `${team1} vs ${team2}`;
  gameContainer.appendChild(gameInfo);

  // Create a container for the dropdown and button
  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add("controls-container");

  // Dropdown selector
  const dropdown = document.createElement("select");
  dropdown.innerHTML = `
    <option value="${team1}">${team1}</option>
    <option value="${team2}">${team2}</option>
  `;
  controlsContainer.appendChild(dropdown);

  // Lock winner button
const button = document.createElement("button");
button.textContent = "Lock Winner";
button.onclick = () => {
  const selectedTeam = dropdown.value;
  placeBet(gameId, selectedTeam);
  button.style.display = 'none';
  dropdown.disabled = true;

  // Store the state in localStorage
  localStorage.setItem(`buttonState_${gameId}`, 'hidden');
  localStorage.setItem(`dropdownState_${gameId}`, 'disabled');
};

// Check if the button state is stored in localStorage
const buttonState = localStorage.getItem(`buttonState_${gameId}`);
if (buttonState === 'hidden') {
  button.style.display = 'none';
}

// Check if the dropdown state is stored in localStorage
const dropdownState = localStorage.getItem(`dropdownState_${gameId}`);
if (dropdownState === 'disabled') {
  dropdown.disabled = true;
}

controlsContainer.appendChild(button);

  controlsContainer.appendChild(button);

  gameContainer.appendChild(controlsContainer);

  return gameContainer;
}

// Function to place a bet
function placeBet(gameId, selectedTeam) {
  const userId = auth.currentUser.uid; // Get the current user ID from Firebase Authentication
  const betsCollection = collection(db, 'bets');
  addDoc(betsCollection, {
    gameId: gameId,
    userId: userId,
    selectedTeam: selectedTeam,
    timestamp: serverTimestamp(),
    Status:false,
  })
  .then((docRef) => {
    console.log('Bet placed successfully with ID: ', docRef.id);
    // Optionally, you can perform additional actions after the bet is placed
  })
  .catch((error) => {
    console.error('Error placing bet: ', error);
  });
}



// Reference to the games list elements
const uclGamesList = document.getElementById("uclGamesList");
const uelGamesList = document.getElementById("uelGamesList");

// Fetch and display games data
getDocs(gamesRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const gameData = doc.data();
      const { team1, team2, competition, active } = gameData;
      const gameId = doc.id; // Get the document ID as the game ID
      if (active) {
        const gameItem = createGameItem(team1, team2, gameId);
        if (competition === 1) {
          uclGamesList.appendChild(gameItem);
        } else if (competition === 2) {
          uelGamesList.appendChild(gameItem);
        }
      }
    });
  })
  .catch((error) => {
    console.error("Error fetching games:", error);
  });

  const createGameForm = document.getElementById("createGameForm");

createGameForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const team1 = document.getElementById("team1").value;
  const team2 = document.getElementById("team2").value;
  const competition = document.getElementById("competition").value;

  try {
    const docRef = await addDoc(collection(db, "games"), {
      team1: team1,
      team2: team2,
      competition: parseInt(competition),
      active: true, // Assuming the game is active by default
      winner: "" // Assuming no winner is set initially
    });

    console.log("Game created with ID: ", docRef.id);
    // Optionally, redirect to another page after game creation
    // window.location.href = "nextpage.html";
  } catch (error) {
    console.error("Error adding game: ", error);
  }
});

