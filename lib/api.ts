// Function to fetch parameter data from the Flask backend
export async function fetchParameter(paramType: string) {
  try {
    const response = await fetch(`/params/${paramType}.json?t=${Date.now()}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${paramType}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${paramType}:`, error)
    return null
  }
}

// Function to fetch multiple parameters at once
export async function fetchParameters(paramTypes: string[]) {
  const results: Record<string, any> = {}

  await Promise.all(
    paramTypes.map(async (paramType) => {
      const data = await fetchParameter(paramType)
      if (data) {
        results[paramType] = data
      }
    }),
  )

  return results
}

