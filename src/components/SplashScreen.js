function SplashScreen() {
  const { login } = useAuth();
  return (
    <div className="screen w-full h-screen flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="absolute w-full h-full animate-spin" style={{animationDuration: '18s'}} viewBox="0 0 100 100" aria-hidden>
          <path id="circle-path" fill="none" d="M 10, 50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"/>
          <text>
            <textPath href="#circle-path" className="fill-current text-teal-400 text-xs tracking-widest uppercase">AuraFit • Adaptive Wellness •</textPath>
          </text>
        </svg>
        <i data-lucide="sparkles" className="w-16 h-16 text-teal-400" aria-hidden></i>
      </div>
      <h1 className="text-4xl font-bold mt-6">AuraFit</h1>
      <p className="mt-2 muted">Personalized schedule from wake -> sleep</p>
      <div className="mt-8">
        <button onClick={login} className="bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded-full font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"></path></svg>
            <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
}
