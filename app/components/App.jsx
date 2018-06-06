import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';

const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');
const loader = new TrufflepigLoader();






export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    };
  }
  async createColony(){
    console.log('createColony()')
    const { privateKey } = await loader.getAccount(0);
    console.log('PRIVATE TEST:');
    console.log(privateKey);
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: privateKey
      }])
    });
    //return await privateKey;
  }
  async getData(){
    console.log('getData()')
    const { privateKey } = await loader.getAccount(0);
    console.log('PRIVATE TEST:');
    console.log(privateKey);
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: privateKey
      }])
    });
    //return await privateKey;
  }

  render() {
    const {notes} = this.state;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
        <Notes notes={notes} onDelete={this.deleteNote} />
      </div>
    );
  }

  addNote = () => {
    this.getData();
    console.log('End of test.')
    /*
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: 'OK'
      }])
    });
    */
  }

  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();

    this.setState({
      notes: this.state.notes.filter(note => note.id !== id)
    });
  }
}
