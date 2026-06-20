import { Scroll, Languages, GraduationCap, Feather, BookOpen } from 'lucide-react'

const map = {
  scroll: Scroll,
  languages: Languages,
  'graduation-cap': GraduationCap,
  feather: Feather,
  book: BookOpen,
}

export default function Icon({ name, ...props }) {
  const Cmp = map[name] || BookOpen
  return <Cmp {...props} />
}
