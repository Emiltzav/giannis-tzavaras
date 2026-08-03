import { Fragment } from 'react'

// Renders a plain string while turning *emphasis* spans into italic <em>.
// Used so that book titles and journal names - wrapped in asterisks in the
// JSON content - appear in italics everywhere (per the owner's request).
export default function RichText({ text }) {
  if (text == null) return null
  const str = String(text)
  if (!str.includes('*')) return <>{str}</>

  const parts = str.split(/(\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 1 && part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
