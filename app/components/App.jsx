import React from 'react';
import uuid from 'uuid';
import connect from '../libs/connect';
import Lanes from './Lanes';
import LaneActions from '../actions/LaneActions';

const col = require('../libs/johnsColony');

const App = ({LaneActions, lanes}) => {

  const addLane = async () => {

    console.log('Should prompt for name, description, etc.')
    console.log('addColony()')
    const colonyAddress = await col.example();
    console.log('PRIVATE TEST:');
    console.log(colonyAddress);

    LaneActions.create({
      id: uuid.v4(),
      name: colonyAddress
    });
    console.log('Is it ok?')
  };

  const load = async () => {

    console.log('load')
    const colonies = await col.getColonies();
    LaneActions.load(colonies);

  };

  return (
    <div>
      <button onClick={load}>LOAD</button>
      <button className="add-lane" onClick={addLane}>+</button>
      <Lanes lanes={lanes} />
    </div>
  );
};

export default connect(({lanes}) => ({
  lanes
}), {
  LaneActions
})(App)
