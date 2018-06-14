import React from 'react';

export default ({tasks}) => (

  <ul>{tasks.map(task =>
    <li key={task.id}>{task.date}: {task.location} - {task.comment}</li>
  )}</ul>
);
