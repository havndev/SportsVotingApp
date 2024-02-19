import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc ,getDocs, getDoc, addDoc, serverTimestamp, query, where,updateDoc,increment} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
    

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

  function checkAdminStatus(user) {
  
    const userId = user.uid;
    const userRef = doc(db, 'users', userId);

    getDoc(userRef).then((docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const isAdmin = userData.Admin;
        if (isAdmin) {
          console.log("admin!!!!");
          
          document.getElementById('reloadBtn').style.display = 'block';
          
        } else {
          
          document.getElementById('reloadBtn').style.display = 'none';
        }
      } else {
        console.log("User document does not exist");
      }
    }).catch((error) => {
      console.error("Error getting user data:", error);
    });
}

    // Listen for authentication state changes
    const auth = getAuth(app);

  // Define a queue to store pending bets
let betQueue = [];

async function processPendingBets() {
    console.log("Processing pending bets...");
    // Iterate over the pending bets
    for (let i = 0; i < betQueue.length; i++) {
        const bet = betQueue[i];
        console.log("Processing bet:", bet);
        // Fetch the game data to determine the winner
        const gameDocRef = doc(db, 'games', bet.gameId);
        const gameDocSnapshot = await getDoc(gameDocRef);
        if (gameDocSnapshot.exists()) {
            const gameData = gameDocSnapshot.data();
            const winner = gameData.winner;
            if (winner !== "") {
                console.log("Winner:", winner);
                // Check if the bet's selected team matches the winner
                if (bet.selectedTeam === winner) {
                    console.log("Updating user points...");
                    // Update user points
                    const userRef = doc(db, 'users', bet.userId);
                    await updateDoc(userRef, { Pontos: increment(1) });
                    console.log("User points updated.");
                }
                // Mark the bet as processed
                await updateDoc(bet.ref, { Status: true });
                console.log("Bet marked as processed:", bet);
            } else {
                console.log("Game winner not determined yet. Skipping bet processing.");
            }
        } else {
            console.log("Game document not found. Skipping bet processing.");
        }
    }
}



// Function to add a bet to the queue
function addBetToQueue(bet) {
    betQueue.push({ ...bet, status: 'pending' });
}

// Function to update user points based on new bets
async function updateUserPoints() {

  console.log('Updating user points...');
    // Clear the betQueue before fetching new bets
    betQueue = [];
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        console.log("userId:",userId);
        // Fetch all bets made by the user
        const betsSnapshot = await getDocs(query(collection(db, 'bets'), where('userId', '==', userId)));
        betsSnapshot.forEach(async (betDoc) => {
            const betData = betDoc.data();
            console.log(betData);
            // Add the bet to the queue only if its status is not resolved
            if (!betData.Status) {
                addBetToQueue({
                    userId: userId,
                    gameId: betData.gameId,
                    selectedTeam: betData.selectedTeam,
                    ref: betDoc.ref // Store reference to the bet document
                });
            }
        });
    }));
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  displayUserInfo(user); // Display user info first
  checkAdminStatus(user);
});

   // Function to fetch users and display leaderboard
   async function displayLeaderboard() {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users = [];

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        users.push({ id: doc.id, ...userData });
      });

      // Sort users by points in descending order
      users.sort((a, b) => b.Pontos - a.Pontos);

      // Display leaderboard
      const leaderboardDiv = document.getElementById('leaderboard');
      leaderboardDiv.innerHTML = ''; // Clear previous content

      users.forEach((user, index) => {

        if(!user.Admin){
          const userElement = document.createElement('div');
        userElement.textContent = `${user.Nome} - Pontos: ${user.Pontos}`;
        userElement.style.marginBottom = '20px';
        leaderboardDiv.appendChild(userElement);
        }
       
      });
    }

    // Call the function to display leaderboard when the page loads
    displayLeaderboard();


// Function to handle reload button click
function handleReloadButtonClick() {
  console.log('Reload button clicked.');

  // Check if the user is an admin
  
  updateUserPoints().then(() => {
      return processPendingBets();
    }).then(() => {
      return displayLeaderboard(); // Display the leaderboard after updating points and processing bets
    }).catch((error) => {
      console.error('Error:', error);
    });
  
}

// Listen for click event on reload button
document.getElementById('reloadBtn').addEventListener('click', handleReloadButtonClick);


