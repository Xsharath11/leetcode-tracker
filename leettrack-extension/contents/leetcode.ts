export const config = {
  matches: [
    "https://leetcode.com/*", 
    "https://leetcode.com/problems/*",
    "https://leetcode.com/submissions/*"
  ]
}

let alreadyDetected = false;

console.log("Leettrack content script is active")

function extractProblemIdFromURL(): string | null {
  const match = window.location.pathname.match(/problems\/([\w-]+)\//)
  return match ? match[1] : null
}

function extractProblemTitle(): string | null {
  const el = document.querySelector("div[data-cy='question-title']")
  return el ? el.textContent?.trim() ?? null : null
}

function detectSubmissionStatus() {
  if (alreadyDetected) return
  const statusEl = document.querySelector('[data-e2e-locator="submission-result"]')

  if (!statusEl) return

  const status = statusEl.textContent?.trim()
  if (status !== "Accepted") return

  alreadyDetected = true

  const problemId = extractProblemIdFromURL()
  const title = extractProblemTitle()

  const payload = {
    problemId,
    title,
    url: window.location.href,
    datesolved: new Date().toISOString()
  }

  console.log("Accepted solution detected: ", payload)

  browser.runtime.sendMessage({
    type: "ACCEPTED_SUBMISSION",
    data: payload
  })
}

const observer = new MutationObserver(() => detectSubmissionStatus());
observer.observe(document.body, { childList: true, subtree: true});


