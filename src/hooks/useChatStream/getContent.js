import {indexOfUint8Array} from "./array"

function parseHeaders(headersString) {
  const headers = {}
  const lines = headersString.split("\r\n")

  for (const line of lines) {
    let [key, value] = line.split(": ", 2)
    key = key.toLowerCase()

    // Check for and handle modifiers in the 'content-type' header
    if (key === "content-type" && value.includes(";")) {
      const parts = value.split(";")
      headers[key] = parts.shift().trim() // the main media type

      headers["content-type-params"] = parts
        .map((part) => {
          const [paramKey, paramValue] = part.split("=", 2).map((s) => s.trim())
          return {[paramKey]: paramValue}
        })
        .reduce((params, param) => ({...params, ...param}), {})
    } else {
      headers[key] = value
    }
  }

  return headers
}

const decoder = new TextDecoder("utf-8")

export function getContent(part) {
  // Find the end of the headers (\r\n\r\n)
  const doubleNewline = new Uint8Array([13, 10, 13, 10]) // \r\n\r\n
  const endOfHeadersIndex = indexOfUint8Array(part, doubleNewline)

  if (endOfHeadersIndex === -1) {
    // Headers not complete, return empty object
    return {}
  }

  // Extract headers
  const headersPart = part.slice(0, endOfHeadersIndex)
  const headersString = decoder.decode(headersPart)
  const headers = parseHeaders(headersString)

  // Extract body
  const bodyPart = part.slice(endOfHeadersIndex + doubleNewline.length)

  // Check content type and handle accordingly
  if (headers["content-type"] === "text/plain") {
    // Handle text
    const text = decoder.decode(bodyPart)
    if (headers["content-type-params"]?.role === "user") {
      return {contentType: "text/plain+user", content: text}
    }
    return {contentType: "text/plain", content: text}
  } else if (headers["content-type"] === "audio/mpeg") {
    // Handle binary audio data
    return {contentType: "audio/mpeg", content: bodyPart}
  } else if (headers["content-type"] === "application/json") {
    // Handle JSON data
    const text = decoder.decode(bodyPart)
    const json = JSON.parse(text)
    return {contentType: "application/json", content: json}
  } else {
    // Handle other content types
    console.log("Unhandled Content-Type:", headers["content-type"])
    const str = decoder.decode(bodyPart)
    return {contentType: headers["content-type"], content: str}
  }
}
