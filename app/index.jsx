import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.css';
import TaskModal from './components/TaskModal';


if(process.env.NODE_ENV !== 'production') {
  // console.log('JOHNS?')
  //React.Perf = require('react-addons-perf');
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
