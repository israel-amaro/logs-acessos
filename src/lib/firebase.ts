import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId) 
  : getFirestore(app);

export type UserRole = 'admin' | 'operator';

export interface AppUserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  createdBy?: string;
}

/**
 * Normalizes input username or email into a full email.
 * If user enters "admin", converts to "admin@senai.br".
 */
export function normalizeEmail(input: string): string {
  const clean = input.trim();
  if (!clean) return 'admin@senai.br';
  if (clean.includes('@')) return clean;
  if (clean.toLowerCase() === 'admin' || clean.toLowerCase() === 'admin.ti') {
    return 'admin@senai.br';
  }
  return `${clean}@senai.br`;
}

/**
 * Authenticates user with Firebase Auth.
 * Performs standard login, creating initial admin user only if user-not-found on first boot.
 */
export async function loginWithFirebase(inputUser: string, inputPass: string): Promise<AppUserProfile> {
  const email = normalizeEmail(inputUser);
  const password = inputPass;

  let userCredential;

  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      // If admin@senai.br doesn't exist at all yet in Firebase Auth, create it once
      if (email.toLowerCase() === 'admin@senai.br') {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password || 'Findes26');
        } catch (createErr: any) {
          throw new Error('Usuário ou senha incorretos.');
        }
      } else {
        throw new Error('Usuário não cadastrado.');
      }
    } else {
      throw new Error('Usuário ou senha incorretos.');
    }
  }

  const user = userCredential.user;

  // Check or create user profile doc in Firestore
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      uid: user.uid,
      email: user.email || email,
      name: data.name || (data.role === 'admin' ? 'Administrador TI (SENAI)' : 'Técnico SENAI'),
      role: data.role || (email === 'admin@senai.br' ? 'admin' : 'operator'),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      createdBy: data.createdBy || 'system',
    };
  } else {
    // Create new profile doc
    const isAdminUser = email.toLowerCase() === 'admin@senai.br';
    const profile: AppUserProfile = {
      uid: user.uid,
      email: user.email || email,
      name: isAdminUser ? 'Administrador TI (SENAI)' : email.split('@')[0],
      role: isAdminUser ? 'admin' : 'operator',
      createdAt: new Date().toISOString(),
      createdBy: 'self-registration',
    };

    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return profile;
  }
}

/**
 * Creates a new user in Firebase Auth and Firestore without disrupting the primary logged-in session.
 */
export async function createNewUserByAdmin(
  newUser: { email: string; pass: string; name: string; role: UserRole },
  adminUid: string
): Promise<AppUserProfile> {
  const email = normalizeEmail(newUser.email);
  const pass = newUser.pass;
  const name = newUser.name.trim() || email.split('@')[0];

  if (!email || !pass || pass.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }

  // Create isolated secondary app to create user without changing primary auth state
  const secondaryAppName = `SecondaryApp_${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const newUid = cred.user.uid;

    const profile: AppUserProfile = {
      uid: newUid,
      email: cred.user.email || email,
      name,
      role: newUser.role,
      createdAt: new Date().toISOString(),
      createdBy: adminUid,
    };

    // Save profile in Firestore db
    await setDoc(doc(db, 'users', newUid), {
      ...profile,
      createdAt: serverTimestamp(),
    });

    await firebaseSignOut(secondaryAuth);
    await deleteApp(secondaryApp);

    return profile;
  } catch (err: any) {
    try {
      await deleteApp(secondaryApp);
    } catch (_) {}

    if (err.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail / usuário já está cadastrado no Firebase.');
    }
    if (err.code === 'auth/weak-password') {
      throw new Error('A senha informada é muito fraca. Mínimo 6 caracteres.');
    }
    throw new Error(`Erro ao criar usuário no Firebase: ${err.message || err.code}`);
  }
}

/**
 * Fetches all users registered in Firestore
 */
export async function fetchAllUsers(): Promise<AppUserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol);
    const snap = await getDocs(q);
    
    const list: AppUserProfile[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        uid: docSnap.id,
        email: d.email || '',
        name: d.name || 'Usuário',
        role: d.role || 'operator',
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || '',
        createdBy: d.createdBy || '',
      });
    });

    return list;
  } catch (err) {
    console.error('Error fetching users from Firestore:', err);
    return [];
  }
}

/**
 * Sign out from primary Firebase Auth
 */
export async function logoutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}
