export const get = (key: string) => JSON.parse(localStorage.getItem(key) || '')
export const set = (key: string, obj: any) => localStorage.setItem(key, JSON.stringify(obj))
