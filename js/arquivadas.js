import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc ,getDocs, getDoc, addDoc, serverTimestamp,query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
    
   
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


// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  displayUserInfo(user); // Display user info first
});

// Reference to the games collection
const gamesRef = collection(db, 'games');


function createGameItem(team1, team2, gameId) {
  const gameContainer = document.createElement("div");
  gameContainer.classList.add("game-container");
  // Add border style
  gameContainer.style.border = "2px solid white";
  gameContainer.style.padding = "10px"; // Add padding for better appearance
  gameContainer.style.borderRadius = "6px";
  gameContainer.style.opacity = "0.8";

  // Display game information
  const gameInfo = document.createElement("p");
  gameInfo.textContent = `${team1} vs ${team2}`;
  gameContainer.appendChild(gameInfo);

  // Create a container for the labels
  const labelsContainer = document.createElement("div");
  labelsContainer.classList.add("labels-container");

  // Check if the user has placed a bet for this game
  const user = auth.currentUser; // Assuming you have access to the current user
  if (user) {
    const userId = user.uid;
    const userBetRef = collection(db, 'bets');
    const q = query(userBetRef, where('userId', '==', userId), where('gameId', '==', gameId));
    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        // User has placed a bet for this game, display the selected team label
        const userBetData = querySnapshot.docs[0].data();
        const selectedTeamLabel = document.createElement("span");
        selectedTeamLabel.style.marginRight = "40px";
        selectedTeamLabel.style.fontWeight = "bold";
        selectedTeamLabel.textContent = `Aposta: ${userBetData.selectedTeam}      `;
        labelsContainer.appendChild(selectedTeamLabel);
      } else {
        const noBetLabel = document.createElement("span");
        noBetLabel.textContent = `Aposta: Não Apostou!`;
        labelsContainer.appendChild(noBetLabel);
      }
    }).catch((error) => {
      console.error("Error getting user bet:", error);
    });
  }

  // Fetch the winner of the game from Firestore
  const gameRef = doc(db, 'games', gameId);
  getDoc(gameRef).then((docSnapshot) => {
    if (docSnapshot.exists()) {
      const gameData = docSnapshot.data();
      const winner = gameData.winner;
      if (winner) {
        const winnerLabel = document.createElement("span");
        winnerLabel.textContent = `Vencedor: ${winner}`;
        labelsContainer.appendChild(winnerLabel);
      } else {
        const noWinnerLabel = document.createElement("span");
        noWinnerLabel.textContent = `Vencedor: Ainda não decidido`;
        labelsContainer.appendChild(noWinnerLabel);
      }
    } else {
      console.log("Game document does not exist");
    }
  }).catch((error) => {
    console.error("Error getting game data:", error);
  });

  gameContainer.appendChild(labelsContainer);

  return gameContainer;
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
      const gameId = doc.id; // Get the document ID as the game IDs
      if (!active) {
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



