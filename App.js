import React, { Component } from 'react';
import Main from './components/MainComponent';
import { LogBox } from 'react-native'; 

// redux
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/ConfigureStore';
const store = ConfigureStore();

class App extends Component {
  constructor(props){
    super(props);
    LogBox.ignoreLogs([
      'TextElement: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.'
    ]);
  }
  render() {
    return (
      <Provider store={store}>
        <Main />
      </Provider>
    );
  }
}
export default App;