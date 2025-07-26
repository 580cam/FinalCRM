'use server'

// Define a server action to safely get user ID
export async function getUserIdFromParams(params: { [key: string]: string | string[] | undefined }): Promise<string> {
  if (!params) return 'all'

  const userIdParam = params.userId
  if (!userIdParam) return 'all'

  if (Array.isArray(userIdParam)) {
    return userIdParam[0] || 'all'
  }

  return userIdParam
}
