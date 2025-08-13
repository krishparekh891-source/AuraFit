function App() {
  const { user, profile, loading } = useAuth();

  React.useEffect(() => {
    // These are non-React libraries that manipulate the DOM directly.
    // We need to re-run them after React has finished rendering.
    // A more robust solution would be to use React-specific libraries
    // or wrap these in components, but for this conversion, this is a
    // direct way to restore the functionality.
    try {
      if (window.lucide) {
        window.lucide.createIcons();
      }
      if (window.CircleType) {
        const tp = document.querySelector('svg textPath');
        if (tp) {
          new window.CircleType(tp).radius(60);
        }
      }
    } catch (e) {
      console.warn("Failed to initialize non-React libraries:", e);
    }
  }, [user, profile, loading]); // Re-run whenever the main screen component changes

  if (loading) {
    return (
        <div className="loading-overlay active" style={{backgroundColor: 'var(--bg)', zIndex: 100}}>
            <div className="spinner"></div>
        </div>
    );
  }

  let content;
  if (!user) {
    content = <SplashScreen />;
  } else if (!profile) {
    content = <OnboardingScreen />;
  } else {
    content = <MainScreen />;
  }

  return (
    <>
      {content}
      <Modal />
      <Loading />
    </>
  );
}
