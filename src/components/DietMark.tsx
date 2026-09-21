// Standard veg / non-veg marker: green square = vegetarian, red = non-vegetarian.
export default function DietMark({ isVeg, isNonVeg }: { isVeg: boolean; isNonVeg: boolean }) {
  if (!isVeg && !isNonVeg) return null
  const color = isNonVeg ? '#b91c1c' : '#15803d'
  return (
    <span
      role="img"
      aria-label={isNonVeg ? 'Non-vegetarian' : 'Vegetarian'}
      title={isNonVeg ? 'Non-vegetarian' : 'Vegetarian'}
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 bg-white"
      style={{ borderColor: color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}
