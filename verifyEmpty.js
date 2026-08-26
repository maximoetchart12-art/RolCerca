import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  projectId: "western-beanbag-420015",
  appId: "1:772043208779:web:33d5fca23cf1844ed0f5ce",
  apiKey: "AIzaSyD4eTj9HRRNEEdSA4eUwjqxa2M9XxAU7XM",
  authDomain: "western-beanbag-420015.firebaseapp.com",
});
const db = getFirestore(app, "ai-studio-mesasrolargentin-70e55ce5-45c1-46eb-ae07-0068182cdfa5");

async function check() {
  const usersSnap = await getDocs(collection(db, "users"));
  console.log(`Users count: ${usersSnap.size}`);
  for (const d of usersSnap.docs) {
    await deleteDoc(doc(db, "users", d.id));
    console.log(`Deleted stray user: ${d.id}`);
  }

  const tablesSnap = await getDocs(collection(db, "tables"));
  console.log(`Tables count: ${tablesSnap.size}`);
  for (const d of tablesSnap.docs) {
    await deleteDoc(doc(db, "tables", d.id));
    console.log(`Deleted stray table: ${d.id}`);
  }
}

check().then(() => {
  console.log("Verification complete.");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
