import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import Lanes from './Lanes';
import LaneActions from '../actions/LaneActions';
import NoteActions from '../actions/NoteActions';
import {Bootstrap, Jumbotron, Button, Grid, Row, Col} from 'react-bootstrap';

const col = require('../libs/johnsColony');
const cTasks = require('../libs/cTasks');

const App = ({LaneActions, lanes}) => {

  const addLane = async () => {

    console.log('Should prompt for name, description, etc.')
    console.log('addColony()')
    const colonyAddress = await col.example();
    console.log('PRIVATE TEST:');
    console.log(colonyAddress);

    LaneActions.create({
      id: uuid.v4(),
      name: colonyAddress
    });
    console.log('Is it ok?')
  };

  const load = async () => {

    console.log('load')
    const colonies = await col.getColonies();
    LaneActions.load(colonies);

    const tasks = await cTasks.getTasks();
    console.log('TASKS: ')
    console.log(tasks)
    var i = 0;
    while(i < tasks.length){
      console.log(tasks[i])
      console.log('ID: ' + tasks[i].id)
      LaneActions.attachToLane({
        laneId: 1,
        noteId: tasks[i].id
      });
      i++;
    }

    NoteActions.load(tasks);
  };

  const createTask = async () => {

    console.log('createTask()')
    await col.createTask();
    console.log('createTask() done');

  };

  return (
    <Jumbotron>
      <h1>This Is A Test</h1>
      <div>
        <Button onClick={load} bsStyle="primary">LOAD</Button>
        <button className="add-lane" onClick={createTask}>CREATE TASK</button>
        <Lanes lanes={lanes} />
      </div>
    </Jumbotron>
  );
};

export default connect(({lanes}) => ({
  lanes
}), {
  LaneActions
})(App)
