import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <main className="min-h-0 flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  )
}
