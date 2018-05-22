import { gql } from "apollo-boost"

export const MediaFragments = {
	CharacterNames: gql`
		fragment CharacterNames on Media {
			characters {
				edges {
					node {
						name {
							first
							last
							alternative
						}
					}
				}
			}
		}
	`,
	Title: gql`
		fragment Title on Media {
			title {
				romaji
				english
			}
		}
	`,
}


interface ICharacterEdge {
	node: ICharacter
}

interface ICharacter {
	name: {
		first: string
		last: string
		alternative: string[]
	}
}

export interface IMediaData {
	id: number
	title: {
		romaji: string
		english: string
	}
	description: string
	characters: {
		edges: ICharacterEdge[]
	}
}

export interface IResponse {
	Page: {
		pageInfo: {
			total: number
		}
		media: IMediaData[]
	}
}
