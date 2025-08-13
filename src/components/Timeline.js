function Timeline({ schedule, onEdit, onDone }) {

  function formatDisplay(t) {
    if (!t) return '';
    const [hh,mm] = t.split(':');
    const h = +hh;
    const period = h >= 12 ? 'PM' : 'AM';
    const dispH = ((h + 11) % 12) + 1;
    return `${dispH}:${mm} ${period}`;
  }

  if (!schedule || schedule.length === 0) {
    return <p>No schedule generated for today.</p>;
  }

  return (
    <section className="bg-gray-900 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">Today's schedule</h3>
      </div>
      <div className="timeline space-y-6 pl-6">
        {schedule.map((item, index) => (
          <div key={index} className="relative pl-4">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-400"></div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-[92px] text-sm muted">{formatDisplay(item.time)}</div>
              <div className="flex-1 bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="muted text-sm mt-1">{item.details}</div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button onClick={() => onDone(index)} className="btn-done bg-teal-500 px-3 py-1 rounded-lg text-sm font-medium hover:bg-teal-600 transition">Done</button>
                    <button onClick={() => onEdit(index)} className="btn-edit bg-gray-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-700 transition">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
