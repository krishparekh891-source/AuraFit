function Header({ profile }) {
  const { logout } = useAuth();

  function formatDisplay(t) {
    if (!t) return '';
    const [hh,mm] = t.split(':');
    const h = +hh;
    const period = h >= 12 ? 'PM' : 'AM';
    const dispH = ((h + 11) % 12) + 1;
    return `${dispH}:${mm} ${period}`;
  }

  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="muted">Welcome back,</p>
        <h2 className="text-2xl font-bold">{profile.name}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm muted text-right">
          <div>{new Date().toDateString()}</div>
          <div className="muted text-xs">
            Wake: {formatDisplay(profile.wake)} · Sleep: {formatDisplay(profile.sleep)}
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center font-bold">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <button onClick={logout} className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">Logout</button>
      </div>
    </header>
  );
}
