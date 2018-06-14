import React from 'react';
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';

export default class AddTask extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleCommentChange = this.handleCommentChange.bind(this);

    this.state = {
      location: '',
      comment: '',
    };
  }
  handleLocationChange(e) {
    this.setState({ location: e.target.value });
  }
  handleCommentChange(e) {
    this.setState({ comment: e.target.value });
  }
  render() {
    return (
      <form>
        <FormGroup>
          <ControlLabel>Spotted A Hole? Enter It Here</ControlLabel>
          <FormGroup>
            <ControlLabel>Location</ControlLabel>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="i.e. Main St, Kirknewton"
              onChange={this.handleLocationChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Comment</ControlLabel>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="i.e. It's a really big hole that's wrecking my cars suspension!"
              onChange={this.handleCommentChange}
            />
          </FormGroup>
          <FormControl.Feedback />
          <Button bsStyle="primary" onClick={() => this.props.addTask(this.state)}>RECORD</Button>
        </FormGroup>
      </form>
    );
  }
}
