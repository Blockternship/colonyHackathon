import React from 'react';
import uuid from 'uuid';
import Tasks from './Tasks';
import AddTask from './AddTask';
import {Bootstrap, Jumbotron, Button, Grid, Row, Col, Modal, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';

const col = require('../libs/johnsColony');
const cTasks = require('../libs/cTasks');

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [{id: 1, location: 'Loading Data From Colony...', comment: '', subdomain: 1, date: new Date().toLocaleString() }],
      subdomains: [
        {id: 1, name: 'WLC', address: uuid.v4(), tasks: []},
        {id: 2, name: 'Intelsat', address: uuid.v4(), tasks: []},
      ]
    };

    const loadedTasks = this.loadColonyTasks();
  }
  async loadColonyTasks(){
    const tasks = await cTasks.getTasks();
    this.setState({
      tasks: tasks
    });
    return tasks;
  }
  async loadInit(){

    console.log('loadInit()')
    const defaultColony = await col.startColony();         // Make sure default colony is loaded

    const tasks = await cTasks.getTasks();
    console.log('LOADING TASKS TO LOCAL: ')
    console.log(tasks)
    this.setState({
      tasks: tasks
    });
  }
  load = () => {
    console.log('load()')
    this.loadInit();
  }
  async upDateColony(Task){

    console.log('upDateColony()')
    console.log('Adding task: ' + Task)

    const id = uuid.v4();
    const date = new Date().toLocaleString();

    const holeDetails = {
      id: id,
      date: date,
      location: Task.location,
      comment: Task.comment,
      subdomain: 1,
      isRepaired: false,
      isConfirmed: false,
    };

    const holeInfo = await cTasks.recordHole(holeDetails);

    console.log('Updating local storage');

    this.setState({
      tasks: this.state.tasks.concat([holeDetails])
    });
  }

  addTask = (Task) => {
    console.log('addTask(): ' + Task)
    this.upDateColony(Task)
    //this.loadInit(this.state.value);
  }
  render() {
    const tasks = this.state.tasks;

    return (
      <div>
          <h1>Fill The Hole! Test?</h1>
          <div>
            <AddTask tasks={tasks} addTask={task => this.addTask(task)}/>
          </div>
          <div>
            <h2>Holes Already Spotted</h2>
            <Tasks tasks={tasks} />
          </div>
      </div>
    );
  }
}
