import React from 'react';
import uuid from 'uuid';
import Tasks from './Tasks';
import AddTask from './AddTask';
import HoleMap from './HoleMapComponent';
import {Bootstrap, Jumbotron, Button, Grid, Row, Col, Modal, OverlayTrigger, Popover, Tooltip, Radio, FormGroup, ControlLabel } from 'react-bootstrap';

const col = require('../libs/johnsColony');
const cTasks = require('../libs/cTasks');

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tasks: [{id: uuid.v4(), location: {lat: 'Loading Data From Colony', lng:''}, comment: '', subdomain: 1, date: new Date().toLocaleString() }], // Displays while we wait to get data from Colony
      companyAddress: '',
      userAddress: '',
    };
    const companyAdd = this.loadCompanyAddress(1);
    const userAdd = this.loadUserAddress(0);
    const loadedTasks = this.loadColonyTasks();                                                               // Load all the existing data from Colony
  }
  async loadCompanyAddress(AddressNo){
    const add = await cTasks.getAddress(AddressNo);
    this.setState({
      companyAddress: add
    });
  }
  async loadUserAddress(AddressNo){
    const add = await cTasks.getAddress(AddressNo);
    this.setState({
      userAddress: add
    });
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

    const holeInfo = await cTasks.recordHole(this.state.userAddress, this.state.companyAddress, holeDetails);

    this.setState({
      tasks: this.state.tasks.concat([holeDetails])                                                           // Update GUI locally immediately
    });

    this.loadColonyTasks();                                                                                   // Load Colony data incase any other new Holes recorded
  }

  addColonyHole = (Hole) => {
    this.upDateColony(Hole)
  }
  handleChange(event){
    console.log(event)
    console.log(event.target.checked)
    console.log(event.target.value)
    const userAdd = this.loadUserAddress(event.target.value);
  }
  handleMarkAsRepaired = (Task) => {
    console.log('Marked As Repaired')
    console.log(Task.comment);
    this.setState({
      tasks: this.state.tasks.map(task => {
        if(task.id === Task.id) {
          task.isRepaired = true;
        }
        return task;
      })
    });
    // NEED TO UPDATE IPFS
  }
  handleMarkAsConfirmed = (Task) => {
    console.log('Mark As Confirmed');
      this.setState({
        tasks: this.state.tasks.map(task => {
          if(task.id === Task.id) {
            task.isConfirmed = true;
          }
          return task;
        })
      });
  }
  render() {
    const holes = this.state.tasks;
    const compAdd = this.state.companyAddress.address;
    const userAdd = this.state.userAddress.address;

    return (
      <div>
          <h1>FIND THE POT?? (HOLE)</h1>
          <div>
            <HoleMap recordHole={hole => this.addColonyHole(hole)} existingHoles={holes}/>
          </div>
          <h2>Set-Up</h2>
          For this demo we assume the user is account(0): {userAdd}
          For this demo we assume the company/worker is account(1): {compAdd}
          <div>
            <h2>Holes Already Spotted</h2>
            <Tasks
              tasks={holes}
              onRepairedClick={this.handleMarkAsRepaired}
              onConfirmedClick={this.handleMarkAsConfirmed}
              />
          </div>
      </div>
    );
  }
}
