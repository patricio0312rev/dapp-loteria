import React, { Component } from 'react';
import './App.css';
import { Container } from 'semantic-ui-react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'
import { Header } from './Header';
import { Tokens } from './Tokens';
import { Loteria } from './Loteria';
import { Premios } from './Premios';

class App extends Component {
  render(){
    return(
      <BrowserRouter>
        <Container>
          <Header />
          
          <main>
            <Switch>
              <Route exact path="/" Component={Tokens}/>
              <Route exact path="/loteria" Component={Loteria}/>
              <Route exact path="/premios" Component={Premios}/>
            </Switch>
          </main>
        </Container>
      </BrowserRouter>
    );
  }
}

export default App;
