export const createGid = (type: string, id: string) => `gid://shopify/${type}/${id}`

export const extractGid = (gid: string) => gid.match(/[^/]+$/i)?.[0]
