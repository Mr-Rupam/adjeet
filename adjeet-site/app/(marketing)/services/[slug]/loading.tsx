export default function ServiceDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="min-h-[40vh] bg-rule" />
      <div className="py-12 border-b border-rule">
        <div className="mx-auto max-w-content px-6 grid sm:grid-cols-3 gap-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-rule rounded" />
              <div className="h-4 w-full bg-rule rounded" />
              <div className="h-4 w-3/4 bg-rule rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
