export const BOUNDARY = "----MultipartStreamBoundary"
export const CHAT_MODEL = "gpt-4-1106-preview"
export const TTS_MODEL = "tts-1"
export const STT_MODEL = "whisper-1"
export const VOICE = "alloy"
export const WORDS_PER_CHUNK = 5
export const TOOLS = [
  {
    type: "function",
    function: {
      name: "set_circle_style",
      description: `Set the style of the circle (default is: {
          width: "64px",
          height: "64px",
          fill: "#10b981",
        })`,
      parameters: {
        type: "object",
        properties: {
          style: {
            type: "object",
            description: "react css style for the circle",
          },
        },
        required: ["style"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_square_style",
      description: `Set the style of the square (default is: {
          width: "64px",
          height: "64px",
          fill: "#ef4444",
        })`,
      parameters: {
        type: "object",
        properties: {
          style: {
            type: "object",
            description: "react css style for the square",
          },
        },
        required: ["style"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_triangle_style",
      description: `Set the style of the triangle (default is: {
          width: "64px",
          height: "64px",
          fill: "#3b82f6",
        })`,
      parameters: {
        type: "object",
        properties: {
          style: {
            type: "object",
            description: "react css style for the triangle",
          },
        },
        required: ["style"],
      },
    },
  },
]
