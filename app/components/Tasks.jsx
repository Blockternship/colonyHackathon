import React from 'react';
import {Button, Table, Radio } from 'react-bootstrap';

export default class Tasks extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const tasks = this.props.tasks;

      return (

        <Table responsive>
          <thead>
            <tr>
              <th>Date Recorded</th>
              <th>Account Recorded</th>
              <th>Location</th>
              <th>Comment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task =>
                <HoleRow
                  key={task.id}
                  task={task}
                  onRepairedClick={this.props.onRepairedClick}
                  onConfirmedClick={this.props.onConfirmedClick}
                  />
            )}
          </tbody>
        </Table>
      );
    }
}

class HoleRow extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const task = this.props.task;
      let button;

      if(task.isConfirmed){
        button = <div>THIS HAS BEEN REPAIRED</div>;
      }
      else if (task.isRepaired) {
        button = <div><Radio name="radioGroup" value='1' inline>
                        1
                      </Radio>{' '}
                      <Radio name="radioGroup" value='2' inline>
                        2
                      </Radio>{' '}
                      <Radio name="radioGroup" value='3' inline>
                        3
                      </Radio>
                      <Button bsStyle="primary" onClick={() => this.props.onConfirmedClick(task)}>CONFIRM & RATE REPAIR</Button></div>;
      }
      else{
        button = <Button bsStyle="primary" onClick={() => this.props.onRepairedClick(task)}>MARK AS REPAIRED</Button>;
      }

      return (
          <tr key={task.id}>
            <td>{task.date}</td>
            <td>{task.manager}</td>
            <td>{task.location.lat.toFixed(2)}:{task.location.lng.toFixed(2)}</td>
            <td>{task.comment}</td>
            <td>{button}</td>
          </tr>
      )
    }
}
