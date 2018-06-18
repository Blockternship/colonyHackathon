import React from 'react';
import {Button, Table, Radio } from 'react-bootstrap';

export default class HoleTable extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const holes = this.props.holes;

      var total = 0;
      var unRepaired = 0;
      var waitingEval = 0;
      var repaired = 0;
      holes.map(hole => {
          total++;
          if(hole.isConfirmed){
            repaired++;
          }
          else if(hole.isRepaired){
            waitingEval++;
          }
          else {
            unRepaired++;
          }
        });

      return (
        <div>
          <h5>Total Holes Reported: {total}</h5>
          <h5>Unrepaired: {unRepaired}</h5>
          <h5>Waiting Evaluation: {waitingEval}</h5>
          <h5>Repaired: {repaired}</h5>
        <Table responsive>
          <thead>
            <tr>
              <th>Date Recorded</th>
              <th>Account Recorded (Manager)</th>
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
                  onLocationClick={this.props.onLocationClick}
                  onRatingClick={this.props.onRatingClick}
                  />
            )}
          </tbody>
        </Table>
        </div>
      );
    }
}

class HoleRow extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        rating: 0
      };
    }
    locationClick(Lat, Lng){
      this.props.onLocationClick(Lat, Lng);                                                                                             // Sets the center of the map to show user location of selected hole
    }
    ratingClick(event){
      //this.props.onRatingClick(event.target.value);
      this.setState({
        rating: event.target.value
      });
    }

    render() {
      const hole = this.props.hole;
      let button;
      const lat = hole.location.lat.toFixed(2);
      const lng = hole.location.lng.toFixed(2);

      if(hole.isConfirmed){
        button = <div>THIS HAS BEEN REPAIRED. RATED: {hole.rating}</div>;
      }
      else if (hole.isRepaired) {
        button = <div><Radio name="radioGroup" value='1' inline onClick={this.ratingClick.bind(this)}>
                        1
                      </Radio>{' '}
                      <Radio name="radioGroup" value='2' inline onClick={this.ratingClick.bind(this)}>
                        2
                      </Radio>{' '}
                      <Radio name="radioGroup" value='3' inline onClick={this.ratingClick.bind(this)}>
                        3
                      </Radio>
                      <Button bsStyle="primary" onClick={() => this.props.onConfirmedClick(hole, this.state.rating)}>CONFIRM & RATE REPAIR</Button></div>;
      }
      else{
        button = <Button bsStyle="primary" onClick={() => this.props.onRepairedClick(hole)}>MARK AS REPAIRED</Button>;
      }

      return (
          <tr key={hole.id} >
            <td>{hole.date}</td>
            <td>{hole.manager}</td>
            <td onClick={() => this.locationClick(hole.location.lat, hole.location.lng)} style={styles.clickable}>{hole.comment}</td>
            <td>{button}</td>
          </tr>
      )
    }
}

const styles = {

  clickable: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
};
