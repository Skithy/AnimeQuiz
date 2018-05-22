import { get } from 'fast-levenshtein'
import { IMediaData } from './query'

const isUpper = (s: string): boolean => s.match(/[A-Z]/) !== null

const closeEnough = (s1: string, s2: string): boolean => (get(s1, s2) / s1.length) <= 0.4

const replaceAll = (s1: string, s2: string): string => s1.replace(new RegExp(`\\b${s2}\\b`, 'g'), '_'.repeat(s2.length))

export const formatDescription = (data: IMediaData, description: string): string => {
	const { title } = data

	const keyWords: string[] = []
	keyWords.push(...getImportant(title.romaji))
	keyWords.push(...getImportant(title.english))

	const characters = data.characters.edges.map(x => x.node)
	for (const character of characters) {
		keyWords.push(...getImportant(character.name.first))
		keyWords.push(...getImportant(character.name.last))
		description = replaceAll(description, character.name.first || '')
		description = replaceAll(description, character.name.last || '')
		for (const other of character.name.alternative) {
			keyWords.push(...getImportant(other))
			description = replaceAll(description, other || '')
		}
	}

	for (const word of getImportant(description)) {
		for (const keyWord of keyWords) {
			if (closeEnough(word, keyWord)) {
				description = replaceAll(description, word)
			}
		}
	}

	return description
}

const getImportant = (s: string): string[] => {
	if (!s) {
		return []
	}
	const words = s.split(/[\W]/)
	return words.filter(w => w && isUpper(w[0]) && !['The', 'Or', 'A'].includes(w))
}
