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

  });

  loginBtn.addEventListener("click", () => {

    window.location.href = 'login.html';

  });

  async function displayUserInfo(user) {
    const userInfoElement = document.getElementById('userInfo');
  
    if (user) {
      // If user is logged in, retrieve their name from Firestore
      const userId = user.uid;
      const userDocRef = doc(db, 'users', userId);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userName = userData.Nome; // Assuming the name field exists in your user document
          userInfoElement.textContent = `Olá, ${userName}`;
        } else {
          userInfoElement.textContent = 'User is not logged in.';
        }
      } catch (error) {
        console.error('Error getting user document:', error);
        userInfoElement.textContent = 'Error getting user data.';
      }
  
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
  // Add border style
  gameContainer.style.border = "2px solid white";
  gameContainer.style.padding = "10px"; // Add padding for better appearance
  gameContainer.style.borderRadius = "6px";

  // Display game information
  const gameInfo = document.createElement("p");
  gameInfo.textContent = `${team1} vs ${team2}`;
  gameInfo.style.fontWeight = "bold";
  gameContainer.appendChild(gameInfo);

  // Create a container for the label
  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add("controls-container");

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
        selectedTeamLabel.textContent = `Aposta: ${userBetData.selectedTeam}`;
        controlsContainer.appendChild(selectedTeamLabel);
      } else {
        // User has not placed a bet for this game, display the dropdown and button
        const dropdown = document.createElement("select");
        dropdown.innerHTML = `
          <option value="${team1}">${team1}</option>
          <option value="${team2}">${team2}</option>
        `;
        controlsContainer.appendChild(dropdown);

        const button = document.createElement("button");
        button.textContent = "Lock Winner";
        button.onclick = () => {
          const selectedTeam = dropdown.value;
          placeBet(gameId, selectedTeam);
          button.style.display = 'none'; // Hide the button after selection
          dropdown.style.display = 'none'; // Hide the dropdown after selection
          const selectedTeamLabel = document.createElement("span");
          selectedTeamLabel.textContent = `Aposta: ${selectedTeam}`;
          controlsContainer.appendChild(selectedTeamLabel);
        };
        controlsContainer.appendChild(button);
      }
    }).catch((error) => {
      console.error("Error getting user bet:", error);
    });
  }

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
        winner: "", // Assuming no winner is set initially
        timestamp: serverTimestamp(),
      });
  
      console.log("Game created with ID: ", docRef.id);
      
    } catch (error) {
      console.error("Error adding game: ", error);
    }
  
});

