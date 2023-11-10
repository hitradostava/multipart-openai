// regex that matches end of sentence puctation or new line
const sentenceEnd = /[\.\?\!]\s|\n/

/**
 * Splits the given text into sentences and returns the first part of the text
 * that is longer than 30 characters, along with the remaining text.
 *
 * @param {string} text - The text to check.
 * @returns {[string, string]} - An array containing the first part of the text
 * that is longer than 30 characters, and the remaining text.
 */
export const checkText = (text) => {
  const sentences = text.split(sentenceEnd)
  const lastSentence = sentences.pop()
  const remaining = lastSentence ? lastSentence : ""
  const start = sentences.join(".")
  if (start.length > 30) {
    return [start, remaining]
  }
  return ["", text]
}

/**
 * Formats an array of tool objects into a string of tool names.
 * @param {Array} tools - An array of tool objects.
 * @returns {string} - A string of formatted tool names.
 */
const formatToolNames = (tools) => {
  const names = tools.map((t) => t.function.name)
  if (names.length === 1) {
    return `${names[0]} tool`
  } else if (names.length === 2) {
    return `${names[0]} and ${names[1]} tools`
  } else {
    return `${names.slice(0, -1).join(", ")}, and ${names.slice(-1)[0]} tools`
  }
}

export const getTextForToolsMessage = (tools) =>
  `To answer your question I'm running the ${formatToolNames(tools)}.`
