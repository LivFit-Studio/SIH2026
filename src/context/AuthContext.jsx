import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, query, getDocs, addDoc } from 'firebase/firestore';
import { TEAMS_DATA, ADMIN_EMAILS } from '../data/teamsDataset';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'team_leader' | 'unauthorized'
  const [userTeam, setUserTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allTeams, setAllTeams] = useState(TEAMS_DATA);

  // Firestore sync for real-time team status updates
  useEffect(() => {
    const fetchFirestoreTeams = async () => {
      try {
        const q = query(collection(db, 'teams'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const loaded = [];
          querySnapshot.forEach(docSnap => {
            loaded.push({ id: docSnap.id, ...docSnap.data() });
          });
          setAllTeams(loaded);
        }
      } catch (err) {
        console.warn('Firestore fetch teams fallback:', err.message);
      }
    };
    fetchFirestoreTeams();
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        processUserAuth(user.email, user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserTeam(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [allTeams]);

  // Process logged in user and record activity
  const processUserAuth = async (email, firebaseUser) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user is Admin
    const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

    // Find team where user is leader or member
    const matchedTeam = allTeams.find(t => {
      if (t.leaderEmail.toLowerCase() === normalizedEmail) return true;
      if (t.members && t.members.some(m => m.email.toLowerCase() === normalizedEmail)) return true;
      return false;
    });

    const activeUserObj = {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || (isAdmin ? 'Bhushan Mallick (Admin)' : email.split('@')[0]),
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    };

    setCurrentUser(activeUserObj);

    let assignedRole = 'unauthorized';
    if (isAdmin) {
      assignedRole = 'admin';
      setUserRole('admin');
      setUserTeam(matchedTeam || allTeams[0]);
    } else if (matchedTeam) {
      assignedRole = 'team_leader';
      setUserRole('team_leader');
      setUserTeam(matchedTeam);
    } else {
      setUserRole('unauthorized');
      setUserTeam(null);
    }

    setLoading(false);

    // Record Login Activity Event to Backend API & Firestore
    recordLoginActivity(activeUserObj, assignedRole, matchedTeam);
  };

  const recordLoginActivity = async (userObj, role, matchedTeam) => {
    const activityPayload = {
      email: userObj.email,
      displayName: userObj.displayName,
      role: role,
      teamName: matchedTeam ? matchedTeam.teamName : 'N/A',
      teamId: matchedTeam ? matchedTeam.id : 'N/A',
      timestamp: new Date().toISOString()
    };

    // 1. Post to Express Server
    try {
      await fetch('/api/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityPayload)
      });
    } catch (err) {
      console.warn('Activity log server notice:', err.message);
    }

    // 2. Save to Firestore loginActivity collection
    try {
      await addDoc(collection(db, 'loginActivity'), activityPayload);
    } catch (err) {
      console.warn('Activity log firestore notice:', err.message);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUserRole(null);
    setUserTeam(null);
  };

  const updateTeamVerificationState = (teamId, verificationData) => {
    setAllTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          status: verificationData.status,
          verificationDetails: verificationData
        };
      }
      return t;
    }));
    if (userTeam && userTeam.id === teamId) {
      setUserTeam(prev => ({
        ...prev,
        status: verificationData.status,
        verificationDetails: verificationData
      }));
    }
  };

  const value = {
    currentUser,
    userRole,
    userTeam,
    loading,
    allTeams,
    signInWithGoogle,
    logout,
    updateTeamVerificationState,
    setAllTeams
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
