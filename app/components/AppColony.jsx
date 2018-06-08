import React from 'react';
import uuid from 'uuid';
import Notes from './Notes';
import connect from '../libs/connect';
import NoteActions from '../actions/NoteActions';


const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');
const loader = new TrufflepigLoader();


class App extends React.Component {

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
    const {notes} = this.props;

    return (
      <div>
        <button onClick={this.addNote}>+</button>
        <Notes
          notes={notes}
          onNoteClick={this.activateNoteEdit}
          onEdit={this.editNote}
          onDelete={this.deleteNote}
          />
      </div>
    );
  }

  addNote = () => {
    //this.getData();
    this.props.NoteActions.create({
      id: uuid.v4(),
      task: 'New task'
    });
  }

  deleteNote = (id, e) => {
    // Avoid bubbling to edit
    e.stopPropagation();
    this.props.NoteActions.delete(id);
  }
  activateNoteEdit = (id) => {
    this.props.NoteActions.update({id, editing: true});
  }
  editNote = (id, task) => {
    this.props.NoteActions.update({id, task, editing: false});
  }
}


export default connect(({notes}) => ({
  notes
}), {
  NoteActions
})(App)
