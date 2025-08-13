const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const { auth, onAuthStateChanged, db, doc, getDoc } = window.firebaseServices;

  const loadUserProfile = async (user) => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      setProfile(profileSnap.data());
    } else {
      setProfile(null); // No profile exists
    }
    setLoading(false);
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      loadUserProfile(user);
    });
    return unsubscribe;
  }, []);

  const login = () => {
    const { GoogleAuthProvider, signInWithPopup } = window.firebaseServices;
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    const { signOut } = window.firebaseServices;
    return signOut(auth);
  };

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    reloadProfile: () => loadUserProfile(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}
