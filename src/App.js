import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import FileLoader from "./Modules/FileLoader";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Automatic PO files translation</h2>
        </div>
        <p className="App-intro">
          Uses russian API service, Yandex Translator (free plan, may glitch)
        </p>
        <div className="files-wrapper">
          <FileLoader allowed={"text/x-gettext-translation"} />
        </div>
      </div>
    )
  }
}

export default App