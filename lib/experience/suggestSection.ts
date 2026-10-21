const RULES: { words: string[]; hint: string }[] = [
  { words: ['سيارة', 'تويوتا', 'camry', 'bmw', 'car'], hint: 'سيار' },
  { words: ['شقة', 'عقار', 'فيلا', 'apartment', 'home'], hint: 'عقار' },
  { words: ['ايفون', 'آيفون', 'iphone', 'جوال', 'موبايل', 'phone'], hint: 'جوال' },
  { words: ['وظيفة', 'job', 'عمل'], hint: 'وظيف' },
  { words: ['أثاث', 'كنب', 'خزانة', 'sofa'], hint: 'أثاث' },
]

/** Keyword hint only. It is not a model and it may match nothing. */
export function suggestSectionName(text: string, names: string[]): string | null {
  const hay = text.toLowerCase()
  for (const rule of RULES) {
    if (!rule.words.some((word) => hay.includes(word.toLowerCase()))) continue
    const found = names.find((name) => name.toLowerCase().includes(rule.hint.toLowerCase()))
    if (found) return found
  }
  return null
}
