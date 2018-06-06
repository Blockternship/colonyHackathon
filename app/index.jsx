import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');


if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}



ReactDOM.render(
  <App />,

  document.getElementById('app')
);
