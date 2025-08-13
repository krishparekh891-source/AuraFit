function OnboardingScreen() {
  const { user, reloadProfile } = useAuth();
  const { db, doc, setDoc } = window.firebaseServices;

  const [formData, setFormData] = React.useState({
    name: user.displayName || '',
    wake: '06:30',
    sleep: '22:30',
    goal: 'loss',
    equip: 'none',
    diet: 'any',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('input-','')]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, formData);
      reloadProfile();
    } catch (error) {
      console.error("Error saving profile: ", error);
      alert("Failed to save profile.");
    }
  };

  return (
    <div className="screen w-full min-h-screen p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Set up your profile</h2>
        <div className="muted">Step 1 of 1</div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm muted" htmlFor="input-name">Name</label>
          <input id="input-name" value={formData.name} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700" placeholder="e.g. Anli" />
        </div>
        <div>
          <label className="text-sm muted" htmlFor="input-wake">Wake time</label>
          <input id="input-wake" type="time" value={formData.wake} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700" />
        </div>
        <div>
          <label className="text-sm muted" htmlFor="input-sleep">Sleep time</label>
          <input id="input-sleep" type="time" value={formData.sleep} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700" />
        </div>
        <div>
          <label className="text-sm muted" htmlFor="input-goal">Primary Goal</label>
          <select id="input-goal" value={formData.goal} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700">
            <option value="loss">Lose weight</option>
            <option value="gain">Build muscle</option>
            <option value="stamina">Improve stamina</option>
            <option value="stress">Reduce stress</option>
          </select>
        </div>
        <div>
          <label className="text-sm muted" htmlFor="input-equip">Equipment</label>
          <select id="input-equip" value={formData.equip} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700">
            <option value="none">No equipment</option>
            <option value="basic">Dumbbells / Bands</option>
            <option value="gym">Full gym</option>
          </select>
        </div>
        <div>
          <label className="text-sm muted" htmlFor="input-diet">Diet</label>
          <select id="input-diet" value={formData.diet} onChange={handleChange} className="w-full mt-2 p-3 rounded-lg bg-gray-900 border border-gray-700">
            <option value="any">Anything</option>
            <option value="veg">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button type="submit" className="bg-teal-500 px-6 py-3 rounded-full font-semibold">Save & Continue</button>
        </div>
      </form>
      <div className="mt-4 muted text-sm">Your profile will be saved to your account.</div>
    </div>
  );
}
