import React from 'react';
import {Button } from 'react-bootstrap';

export default ({tasks}) => (
  <div>
  <ul>{tasks.map(task =>
    <div><li key={task.id}>{task.date}: {task.location} - {task.comment}</li><Button bsStyle="primary">CONFIRM REPAIRED</Button></div>
  )}</ul>
  </div>
);
