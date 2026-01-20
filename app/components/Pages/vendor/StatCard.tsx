type Props = {
  title: string;
  value: string;
  icon: React.ReactNode;
};

export default function StatCard({ title, value, icon }: Props) {
  return (
    <div className="bg-white p-5 rounded-lg shadow flex items-center justify-between">
      <div>
        <p className="text-gray-900 text-sm">{title}</p>
        <h3 className="text-xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className="text-green-600">{icon}</div>
    </div>
  );
}
