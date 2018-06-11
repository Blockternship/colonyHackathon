import React from 'react';
import Note from './Note';
import Editable from './Editable';


export default ({ notes, onNoteClick=() => {}, onEdit=() => {}, onDelete=() => {}}) => (

  <ul>{notes.map(({id, editing, task, title}) =>
    <li key={id}>
      <Note onClick={onNoteClick.bind(null, id)}>
        <Editable
           editing={editing}
           value={title}
           onEdit={onEdit.bind(null, id)} />
        <button onClick={onDelete.bind(null, id)}>x</button>
      </Note>
    </li>
  )}
  </ul>
)
