import React from 'react';
import {Button } from 'react-bootstrap';

export default class Tasks extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const tasks = this.props.tasks;

      return (
          <ul>{tasks.map(task =>
            <div>
              <Task
                task={task}
                onRepairedClick={this.props.onRepairedClick}
                onConfirmedClick={this.props.onConfirmedClick}
                />
            </div>
          )}</ul>
      );
    }
}

class Task extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const task = this.props.task;
      let button;

      if(task.isConfirmed){
        button = <div>WELL DONE!</div>;
      }
      else if (task.isRepaired) {
        button = <Button bsStyle="primary" onClick={() => this.props.onConfirmedClick(task)}>CONFIRM REPAIRED</Button>;
      }
      else{
        button = <Button bsStyle="primary" onClick={() => this.props.onRepairedClick(task)}>MARK REPAIRED</Button>;
      }

      return (
        <div>
        <li key={task.id}>{task.date}: {task.manager} {task.location.lat}:{task.location.lng} {task.comment}</li>
        {button}
        </div>
      )
    }
}
