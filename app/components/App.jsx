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
      tasks: [{id: 1, title: 'Loading Tasks...', description: '', subdomain: 1 }],
      subdomains: [
        {id: 1, name: 'WLC', address: uuid.v4(), tasks: []},
        {id: 2, name: 'Intelsat', address: uuid.v4(), tasks: []},
      ]
    };

    const loadedTasks = this.test();
    console.log('After test');
  }
  async test(){
    console.log('test');
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
    this.setState({
      tasks: this.state.tasks.concat([{
        title: Task,
        description: 'Test'
      }])
    });

    //const tasks = await cTasks.getTasks();
    console.log(this.props.tasks);
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
          <h1>Get It Done!</h1>
          <div>
            <Button onClick={() => this.load()} bsStyle="primary">LOAD</Button>
            <Button bsStyle="primary" onClick={() => console.log('Needs done')}>ADD COMPANY</Button>
            <button className="add-lane" onClick={() => console.log('Needs done')}>CREATE TASK</button>
          </div>
          <div>
            <button onClick={() => console.log('add note')}>+</button>
            <Tasks tasks={tasks} />
          </div>
          <AddTask tasks={tasks} addTask={task => this.addTask(task)}/>
      </div>

    );
  }
}
