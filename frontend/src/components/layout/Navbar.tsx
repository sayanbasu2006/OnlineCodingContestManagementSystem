export default function Navbar() {
  return (
    <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      <div className="flex items-center space-x-3">
        <span className="text-gray-400">Sayan</span>
        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}
