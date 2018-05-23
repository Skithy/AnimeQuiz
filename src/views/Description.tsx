import { gql } from 'apollo-boost'
import * as React from 'react'
import { ChildProps, graphql } from 'react-apollo'
import { Button } from 'semantic-ui-react'
import { formatDescription } from './formatDescription'
import { MediaFragments } from './query'

interface IInputProps {
	animeId: number
}

interface IState {
	reveal: boolean
}


const monospaceStyle = {
	fontFamily: 'monospace'
}

class Description extends React.PureComponent<ChildProps<IInputProps, IResponse>, IState> {
	state = {
		reveal: false
	}

	componentDidUpdate(prevProps: ChildProps<IInputProps, IResponse>) {
		if (this.props.data && this.props.data !== prevProps.data) {
			this.setState({ reveal: false })
		}
	}

	toggleReveal = () => this.setState({ reveal: !this.state.reveal })

	render() {
		const { loading, Media, error } = this.props.data!
		if (loading) { return <div>Loading</div> }
		if (error) { return <h1>ERROR</h1> }
		if (!Media) { return <h1>Not Found</h1> }

		const txt = document.createElement('textarea')
		txt.innerHTML = Media.description

		let description = txt.innerText
		description = description.replace(/<br>/g, '\n')
		description = description.replace(/\(Source: [^(]*\)/g, '')
		description = description.replace(/\(Summary [^(]*\)/g, '')
		description = description.replace(/\[Written [^[]*\]/g, '')

		const newDescription = formatDescription(Media, description)

		return (
			<div style={{ marginTop: 3.5 }}>
				<Button onClick={this.toggleReveal}>Reveal</Button>
				{this.state.reveal
					? <div>
						<h1 style={monospaceStyle}>{Media.title.romaji}</h1>
						<h2 style={monospaceStyle}>{Media.title.english}</h2>
						<div style={monospaceStyle}>{description.split('\n').map((text, i) => <p key={i}>{text}</p>)}</div>
						<img src={Media.coverImage.large} />
					</div>
					: <div>
						<h1 style={monospaceStyle}>{Media.title.romaji ? '_'.repeat(Media.title.romaji.length) : ''}</h1>
						<h2 style={monospaceStyle}>{Media.title.english ? '_'.repeat(Media.title.english.length) : ''}</h2>
						<div style={monospaceStyle}>{newDescription.split('\n').map((text, i) => <p key={i}>{text}</p>)}</div>
						<img src={Media.coverImage.large} style={{ display: 'none' }} />
					</div>
				}
			</div>
		)
	}
}

const GET_ANIME = gql`
	query GetAnime($id: Int!) {
		Media(type: ANIME, id: $id) {
			id
			description
			coverImage {
				large
			}
			...CharacterNames
			...Title
		}
	}
	${MediaFragments.CharacterNames}
	${MediaFragments.Title}
`

interface ICharacter {
	node: {
		name: {
			first: string
			last: string
			alternative: string[]
		}
	}
}

interface IResponse {
	Media: {
		id: number
		description: string
		coverImage: {
			large: string
		}
		characters: {
			edges: ICharacter[]
		}
		title: {
			romaji: string
			english: string
		}
	}
}

const withAnime = graphql<IInputProps, IResponse>(GET_ANIME, {
	options: ({ animeId }) => ({
		variables: { id: animeId }
	})
})

export default withAnime(Description)
