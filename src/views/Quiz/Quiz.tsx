import { gql } from "apollo-boost"
import * as React from "react"
import { ChildProps, graphql } from "react-apollo"
import { Button, Container } from "semantic-ui-react"
import { get, set } from "../../scripts/store"
import { MediaFormat, MediaType, QuizType, TagCategory } from "../constants"
import Description from "../Description"

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min
const getRandomValue = (arr: any[]) => arr[getRandomInt(0, arr.length - 1)]

interface IQuizProps {
  name: QuizType
  type?: MediaType
  format_in?: MediaFormat[]
  popularity_greater?: number
  category?: TagCategory
  return: () => void
}

interface IQuizState {
  allIds: number[]
  correctIds: number[]
  selectedId: number
  wrongIds: number[]
  skipIds: number[]
}

class Quiz extends React.PureComponent<
  ChildProps<IQuizProps, IResponse>,
  IQuizState
> {
  correctIdsStore = `${this.props.type}_${this.props.name}_correctIds`
  wrongIdsStore = `${this.props.type}_${this.props.name}_wrongIds`
  skipIdsStore = "skipIds"
  selectedIdStore = `${this.props.type}_${this.props.name}_selectedId`
  state = {
    allIds: [],
    correctIds: get(this.correctIdsStore) || [],
    selectedId: get(this.selectedIdStore) || -1,
    skipIds: get(this.skipIdsStore) || [],
    wrongIds: get(this.wrongIdsStore) || []
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
                media: [...prev.Page.media, ...fetchMoreResult.Page.media]
              }
            }
            return copy
          },
          variables: {
            page: Page.pageInfo.currentPage + 1
          }
        })
      } else {
        const { correctIds, wrongIds, skipIds } = this.state
        const allIds = Page!.media.map(x => x.id)
        const availableIds = allIds.filter(
          id =>
            !correctIds.includes(id) &&
            !wrongIds.includes(id) &&
            !skipIds.includes(id)
        )
        const selectedId =
          this.state.selectedId === -1
            ? getRandomValue(availableIds)
            : this.state.selectedId
        this.setState({ allIds, selectedId })
        set(this.selectedIdStore, selectedId)
      }
    }
  }

  handleNew = () => {
    if (confirm("Reset your progress?")) {
      const selectedId = getRandomValue(this.state.allIds)
      this.setState({
        correctIds: [],
        selectedId,
        wrongIds: []
      })
      set(this.selectedIdStore, selectedId)
      set(this.correctIdsStore, [])
      set(this.wrongIdsStore, [])
    }
  }

  handleCorrect = () => {
    const { allIds, correctIds, wrongIds, skipIds } = this.state
    const newCorrectIds = [...correctIds, this.state.selectedId]
    const availableIds = allIds.filter(
      id =>
        !newCorrectIds.includes(id) &&
        !wrongIds.includes(id) &&
        !skipIds.includes(id)
    )
    const selectedId = getRandomValue(availableIds)
    this.setState({ correctIds: newCorrectIds, selectedId })
    set(this.selectedIdStore, selectedId)
    set(this.correctIdsStore, newCorrectIds)
  }

  handleWrong = () => {
    const { allIds, correctIds, wrongIds, skipIds } = this.state
    const newWrongIds = [...wrongIds, this.state.selectedId]
    const availableIds = allIds.filter(
      id =>
        !correctIds.includes(id) &&
        !newWrongIds.includes(id) &&
        !skipIds.includes(id)
    )
    const selectedId = getRandomValue(availableIds)
    this.setState({ wrongIds: newWrongIds, selectedId })
    set(this.selectedIdStore, selectedId)
    set(this.wrongIdsStore, newWrongIds)
  }

  handleSkip = () => {
    const { allIds, correctIds, wrongIds, skipIds } = this.state
    const newSkipIds = [...skipIds, this.state.selectedId]
    const availableIds = allIds.filter(
      id =>
        !correctIds.includes(id) &&
        !wrongIds.includes(id) &&
        !newSkipIds.includes(id)
    )
    const selectedId = getRandomValue(availableIds)
    this.setState({ skipIds: newSkipIds, selectedId })
    set(this.selectedIdStore, selectedId)
    set(this.skipIdsStore, newSkipIds)
  }

  confirmSkip = () => {
    if (confirm("Season two summary sucks...")) {
      this.handleSkip()
    }
  }

  render() {
    const { loading, error } = this.props.data!
    if (loading || this.state.allIds.length === 0) {
      return <div>Loading...</div>
    }
    if (error) {
      return <h1>ERROR</h1>
    }

    const { allIds, correctIds, wrongIds, skipIds, selectedId } = this.state
    const availableIds = allIds.filter(
      id =>
        !correctIds.includes(id) &&
        !wrongIds.includes(id) &&
        !skipIds.includes(id)
    )

    if (availableIds.length === 0) {
      return (
        <Container>
          <div>
            <Button onClick={this.props.return}>Return</Button>
            <Button onClick={this.handleNew}>New</Button>
          </div>
          <div>
            <h1>Congrats! You finished!!</h1>
            <h2>Correct: {correctIds.length}</h2>
            <h2>Wrong: {wrongIds.length}</h2>
          </div>
        </Container>
      )
    }

    return (
      <Container>
        <Button onClick={this.props.return}>Return</Button>
        <Button onClick={this.handleNew}>New</Button>
        <Button onClick={this.confirmSkip}>Summary sucks</Button>
        <div style={{ marginTop: 3.5 }}>
          <Button positive={true} onClick={this.handleCorrect}>
            Correct - {correctIds.length}
          </Button>
          <Button negative={true} onClick={this.handleWrong}>
            Wrong - {wrongIds.length}
          </Button>
          <p>Total - {availableIds.length}</p>
        </div>
        <Description
          animeId={selectedId}
          type={this.props.type}
          handleSkip={this.handleSkip}
        />
      </Container>
    )
  }
}

interface IMedia {
  id: number
}

interface IResponse {
  Page: {
    pageInfo: {
      currentPage: number;
      hasNextPage: boolean;
    };
    media: IMedia[];
  }
}

const GET_ALL_ANIME = gql`
  query GetAllAnime(
    $page: Int
    $type: MediaType
    $popularity_greater: Int
    $category: String
    $format_in: [MediaFormat]
  ) {
    Page(perPage: 50, page: $page) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(
        type: $type
        popularity_greater: $popularity_greater
        tagCategory_in: [$category]
        format_in: $format_in
      ) {
        id
      }
    }
  }
`

const withAllAnime = graphql<IQuizProps, IResponse>(GET_ALL_ANIME, {
  options: ({ type, popularity_greater, category, format_in }) => ({
    variables: {
      category,
      format_in,
      page: 1,
      popularity_greater,
      type
    }
  })
})
export default withAllAnime(Quiz)
