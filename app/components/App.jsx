import React from 'react';
import uuid from 'uuid';
import Tasks from './Tasks';
import AddTask from './AddTask';
import HoleMap from './HoleMapComponent';
import {Bootstrap, Jumbotron, Button, Grid, Row, Col, Modal, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';

const col = require('../libs/johnsColony');
const cTasks = require('../libs/cTasks');

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [{id: uuid.v4(), location: {lat: 'Loading Data From Colony', lng:''}, comment: '', subdomain: 1, date: new Date().toLocaleString() }], // Displays while we wait to get data from Colony
    };

    const loadedTasks = this.loadColonyTasks();                                                               // Load all the existing data from Colony
  }
  async loadColonyTasks(){                                                                                    // Called from constructor to load all tasks from colony
    const tasks = await cTasks.getTasks();
    this.setState({
      tasks: tasks
    });
    return tasks;
  }
  async upDateColony(HoleInfo){                                                                               // Stores hole info from map into Colony

    const id = uuid.v4();
    const date = new Date().toLocaleString();

    const holeDetails = {
      id: id,
      date: date,
      location: HoleInfo.markerPosition,
      comment: HoleInfo.comment,
      subdomain: 1,
      isRepaired: false,
      isConfirmed: false,
    };

    const holeInfo = await cTasks.recordHole(holeDetails);

    this.setState({
      tasks: this.state.tasks.concat([holeDetails])                                                           // Update GUI locally immediately
    });

    this.loadColonyTasks();                                                                                   // Load Colony data incase any other new Holes recorded
  }

  addColonyHole = (Hole) => {
    this.upDateColony(Hole)
  }
  render() {
    const holes = this.state.tasks;

    return (
      <div>
          <h1>FIND THE POT (HOLE)</h1>
          <div>
            <HoleMap recordHole={hole => this.addColonyHole(hole)} existingHoles={holes}/>
          </div>
          <div>
            <h2>Holes Already Spotted</h2>
            <Tasks tasks={holes} />
          </div>
      </div>
    );
  }
}
