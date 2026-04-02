"use client"

export function DeleteButtonWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}
