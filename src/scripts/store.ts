export const get = (key: string) => {
	const item = localStorage.getItem(key)
	return item ? JSON.parse(item) : null
}
export const set = (key: string, obj: any) => localStorage.setItem(key, JSON.stringify(obj))
