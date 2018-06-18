import React from 'react';
import {Button, Table, Radio } from 'react-bootstrap';

export default class HoleTable extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const holes = this.props.holes;

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
            {holes.map(hole =>
                <HoleRow
                  key={hole.id}
                  hole={hole}
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
      const hole = this.props.hole;
      let button;
      const lat = hole.location.lat.toFixed(2);
      const lng = hole.location.lng.toFixed(2);

      if(hole.isConfirmed){
        button = <div>THIS HAS BEEN REPAIRED</div>;
      }
      else if (hole.isRepaired) {
        button = <div><Radio name="radioGroup" value='1' inline>
                        1
                      </Radio>{' '}
                      <Radio name="radioGroup" value='2' inline>
                        2
                      </Radio>{' '}
                      <Radio name="radioGroup" value='3' inline>
                        3
                      </Radio>
                      <Button bsStyle="primary" onClick={() => this.props.onConfirmedClick(hole)}>CONFIRM & RATE REPAIR</Button></div>;
      }
      else{
        button = <Button bsStyle="primary" onClick={() => this.props.onRepairedClick(hole)}>MARK AS REPAIRED</Button>;
      }

      return (
          <tr key={hole.id}>
            <td>{hole.date}</td>
            <td>{hole.manager}</td>
            <td>{lat}:{lng}</td>
            <td>{hole.comment}</td>
            <td>{button}</td>
          </tr>
      )
    }
}
