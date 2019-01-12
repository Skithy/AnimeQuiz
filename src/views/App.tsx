import * as React from "react"
import { Container } from "semantic-ui-react"
import QuizSelect from "./QuizSelect/QuizSelect"

class App extends React.PureComponent {
  render() {
    return (
      <Container>
        <QuizSelect />
      </Container>
    )
  }
}
export default App
