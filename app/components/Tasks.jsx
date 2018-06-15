import React from 'react';
import {Button } from 'react-bootstrap';

export default class Tasks extends React.Component {

    confirmRepaired(Test){
      console.log('confirmRapired()');
      console.log(Test)
    }

    render() {
      const tasks = this.props.tasks;
      return (
          <ul>{tasks.map(task =>
            <div><li key={task.id}>{task.date}: {task.location.lat}:{task.location.lng} {task.comment}</li><Button bsStyle="primary" onClick={() => this.confirmRepaired(task.id)}>CONFIRM REPAIRED</Button></div>
          )}</ul>
      );
    }
}
