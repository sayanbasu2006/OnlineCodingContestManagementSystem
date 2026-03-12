export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {["Total Contests", "Total Problems", "Total Submissions"].map((item) => (
        <div
          key={item}
          className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700"
        >
          <h3 className="text-gray-400">{item}</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
      ))}
    </div>
  );
}
