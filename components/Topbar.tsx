export default function Topbar({ title }: { title: string }) {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </header>
  )
}
