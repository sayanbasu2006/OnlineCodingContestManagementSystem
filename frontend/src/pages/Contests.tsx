export default function Contests() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Contests</h2>
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full text-left">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="p-4">Name</th>
              <th>Status</th>
              <th>Start Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700">
              <td className="p-4">Weekly Contest 1</td>
              <td className="text-blue-400">Ongoing</td>
              <td>12 Sept 2025</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
