export function numbersIn(text: string) {
  return text.match(/\d+(?:\.\d+)?/g) ?? []
}

// Numbers in the AI's text that were not in the facts we gave it
export function findInventedNumbers(text: string, allowedNumbers: Set<string>) {
  return numbersIn(text).filter((value) => !allowedNumbers.has(value))
}