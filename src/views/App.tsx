import { gql } from 'apollo-boost'
import * as React from 'react'
import { ChildProps, graphql } from 'react-apollo'
import { Button, Container } from 'semantic-ui-react'
import Description from './Description'

const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
const getRandomValue = (arr: any[]) => arr[getRandomInt(0, arr.length - 1)]

interface IState {
  allIds: number[]
  correctIds: number[]
  selectedId: number
  wrongIds: number[]
}

class Character extends React.PureComponent<ChildProps<{}, IResponse>, IState> {
  state = {
    allIds: [],
    correctIds: [],
    selectedId: -1,
    wrongIds: [],
  }

  componentDidUpdate(prevProps: ChildProps<{}, IResponse>) {
    const { Page, fetchMore } = this.props.data!
    if (Page && prevProps.data!.Page !== Page) {
      if (Page.pageInfo.hasNextPage) {
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) {
              return prev
            }
            const copy: IResponse = {
              ...fetchMoreResult,
              Page: {
                ...fetchMoreResult.Page,
                media: [
                  ...prev.Page.media,
                  ...fetchMoreResult.Page.media
                ]
              }
            }
            return copy
          },
          variables: {
            page: Page.pageInfo.currentPage + 1
          },
        })
      } else {
        const allIds = Page!.media.map(x => x.id)
        this.setState({ allIds, selectedId: getRandomValue(allIds) })
      }
    }
  }

  handleNew = () => {
    this.setState({
      correctIds: [],
      selectedId: getRandomValue(this.state.allIds),
      wrongIds: [],
    })
  }

  handleCorrect = () => {
    const { allIds, correctIds, wrongIds } = this.state
    const newCorrectIds = [...correctIds, this.state.selectedId]
    const availableIds = allIds.filter(id => !newCorrectIds.includes(id) && !wrongIds.includes(id))
    this.setState({ correctIds: newCorrectIds, selectedId: getRandomValue(availableIds) })
  }

  handleWrong = () => {
    const { allIds, correctIds, wrongIds } = this.state
    const newWrongIds = [...wrongIds, this.state.selectedId]
    const availableIds = allIds.filter(id => !correctIds.includes(id) && !newWrongIds.includes(id))
    this.setState({ wrongIds: newWrongIds, selectedId: getRandomValue(availableIds) })
  }

  render() {
    const { loading, error } = this.props.data!
    if (loading || this.state.allIds.length === 0) { return <div>Loading</div> }
    if (error) { return <h1>ERROR</h1> }

    return (
      <Container>
        <Button onClick={this.handleNew}>New</Button>
        <Button onClick={this.handleCorrect}>Correct - {this.state.correctIds.length}</Button>
        <Button onClick={this.handleWrong}>Wrong - {this.state.wrongIds.length}</Button>
        <Description animeId={this.state.selectedId} />
      </Container>
    )
  }
}


const GET_ALL_ANIME = gql`
  query GetAllAnime($page: Int) {
    Page(perPage: 50, page: $page) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(type: ANIME, popularity_greater: 7000) {
        id
	    }
    }
  }
`

interface IMedia {
  id: number
}

interface IResponse {
  Page: {
    pageInfo: {
      currentPage: number
      hasNextPage: boolean
    }
    media: IMedia[]
  }
}

const withAllAnime = graphql<{}, IResponse>(GET_ALL_ANIME, {
  options: () => ({ variables: { page: 1 } })
})
export default withAllAnime(Character)
