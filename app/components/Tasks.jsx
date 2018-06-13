import React from 'react';

export default ({tasks}) => (

  <ul>{tasks.map(task =>
    <li key={task.id}>{task.title} {task.description}</li>
  )}</ul>
);