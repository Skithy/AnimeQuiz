import ApolloClient from "apollo-boost"
import * as React from "react"
import { ApolloProvider } from "react-apollo"
import { render } from "react-dom"

import "./index.css"
import { unregister } from "./scripts/registerServiceWorker"

import App from "./views/App"

const client = new ApolloClient({ uri: "https://graphql.anilist.co" })

const ApolloApp = (AppComponent: React.ComponentClass) => (
  <ApolloProvider client={client}>
    <AppComponent />
  </ApolloProvider>
)

render(ApolloApp(App), document.getElementById("root"))
unregister()
