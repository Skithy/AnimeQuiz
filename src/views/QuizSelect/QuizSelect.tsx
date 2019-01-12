import * as React from "react"
import {
  Button,
  Container,
  Dropdown,
  DropdownItemProps
} from "semantic-ui-react"
import { MediaFormat, MediaType, QuizType, TagCategory } from "../constants"
import Quiz from "../Quiz/Quiz"

interface IQuizSelectState {
  mediaType: MediaType
  selectedQuiz: QuizType
}

class QuizSelect extends React.PureComponent<{}, IQuizSelectState> {
  options = {
    [QuizType.popular]: { name: QuizType.popular, popularity_greater: 7000 },
    [QuizType.action]: { name: QuizType.action, category: TagCategory.action },
    [QuizType.comedy]: { name: QuizType.comedy, category: TagCategory.comedy },
    [QuizType.drama]: { name: QuizType.drama, category: TagCategory.drama },
    [QuizType.fantasy]: {
      category: TagCategory.fantasy,
      name: QuizType.fantasy
    },
    [QuizType.mecha]: { name: QuizType.mecha, category: TagCategory.mecha },
    [QuizType.nsfw]: { name: QuizType.nsfw, category: TagCategory.nsfw },
    [QuizType.romance]: {
      category: TagCategory.romance,
      name: QuizType.romance
    },
    [QuizType.sliceOfLife]: {
      category: TagCategory.sliceOfLife,
      name: QuizType.sliceOfLife
    },
    [QuizType.sport]: { name: QuizType.sport, category: TagCategory.sport },
    [QuizType.universe]: {
      category: TagCategory.universe,
      name: QuizType.universe
    }
  }
  mediaTypeOptions = {
    [MediaType.ANIME]: {
      format_in: [MediaFormat.TV, MediaFormat.TV_SHORT, MediaFormat.MOVIE],
      type: MediaType.ANIME
    },
    [MediaType.MANGA]: {
      format_in: [MediaFormat.MANGA, MediaFormat.NOVEL],
      popularity_greater: 100,
      type: MediaType.MANGA
    }
  }

  state = {
    mediaType: MediaType.ANIME,
    selectedQuiz: QuizType.none
  }

  return = (): void => this.setState({ selectedQuiz: QuizType.none })
  changeQuiz = (quiz: QuizType): void => this.setState({ selectedQuiz: quiz })
  changeType = (_e: any, data: any) => this.setState({ mediaType: data.value })

  render() {
    console.log(this.state)
    if (this.state.selectedQuiz !== QuizType.none) {
      return (
        <Quiz
          return={this.return}
          name={this.state.selectedQuiz}
          {...this.mediaTypeOptions[this.state.mediaType]}
          {...this.options[this.state.selectedQuiz]}
        />
      )
    }

    const dropDownOptions: DropdownItemProps[] = [
      { text: "Anime", value: MediaType.ANIME },
      { text: "Manga", value: MediaType.MANGA }
    ]

    const QuizButton: React.FC<{ quiz: QuizType }> = ({ quiz }) => {
      const handleClick = () => this.changeQuiz(quiz)
      return <Button onClick={handleClick}>{quiz}</Button>
    }

    return (
      <Container>
        {Object.keys(this.options).map((quiz, i) => (
          <QuizButton quiz={quiz as QuizType} key={i} />
        ))}
        <Dropdown
          value={this.state.mediaType}
          onChange={this.changeType}
          placeholder="Manga or Anime"
          options={dropDownOptions}
        />
      </Container>
    )
  }
}

export default QuizSelect
