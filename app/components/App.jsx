import React from 'react';
import uuid from 'uuid';
import HoleTable from './HoleTable';
import HoleMap from './HoleMapComponent';

const colonyHelper = require('../libs/colonyHelper');

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      holes: [{id: uuid.v4(), manager: 'Loading Data From Colony', location: {lat: 0, lng: 0}, comment: 'Please Wait', subdomain: 1, date: new Date().toLocaleString() }], // Displays while we wait to get data from Colony
      companyAddress: '',
      userAddress: '',
      mapCenter: { lat: 55.888215, lng: -3.427228 },
    };
    const companyAdd = this.loadCompanyAddress(1);                                                            // Making Company address default to 1
    const userAdd = this.loadUserAddress(0);                                                                  // Making User address default to 0
    this.loadColonyHoles();                                                                                   // Load all the existing data from Colony
  }
  async loadCompanyAddress(AddressNo){
    const add = await colonyHelper.getAccountInfo(AddressNo);
    this.setState({
      companyAddress: add
    });
  }
  async loadUserAddress(AddressNo){
    const add = await colonyHelper.getAccountInfo(AddressNo);
    this.setState({
      userAddress: add
    });
  }
  async loadColonyHoles(){                                                                                    // Called from constructor to load all holes from colony
    const holes = await colonyHelper.getTasks();
    this.setState({
      holes: holes
    });
  }
  async saveHoleToColony(HoleInfo){                                                                               // Stores hole info to Colony

    const id = uuid.v4();
    const date = new Date().toLocaleString();                                                                     // Date/time of record

    const holeDetails = {
      id: id,
      date: date,
      location: HoleInfo.markerPosition,
      comment: HoleInfo.comment,
      subdomain: 1,
      isRepaired: false,                                                                                          // These default to false on first save so that users can score, etc
      isConfirmed: false,
    };

    const holeInfo = await colonyHelper.recordHole(this.state.userAddress, this.state.companyAddress, holeDetails); // Does actual Colony update

    this.setState({
      holes: this.state.holes.concat([holeDetails])                                                               // Update GUI locally immediately
    });

    this.loadColonyHoles();                                                                                       // Load Colony data incase any other new Holes recorded
  }
  recordHole = (Hole) => {
    this.saveHoleToColony(Hole);                                                                                  // Called when map clicked
  }
  async upDateHole(TaskId, HoleInfo){                                                                             // Saves new hole info to Colony/IPFS
    await colonyHelper.updateTask(TaskId, HoleInfo);
    //this.loadColonyHoles();                                                                                     // Load Colony data incase any other new Holes recorded
  }
  handleMarkAsRepaired = (Hole) => {                                                                              // When existing Hole is marked as repaired by Worker
    this.setState({                                                                                               // Update local GUI
      holes: this.state.holes.map(hole => {
        if(hole.id === Hole.id) {
          hole.isRepaired = true;
        }
        return hole;
      })
    });

    this.upDateHole(Hole.id, Hole);                                                                                 // Update Colony
  }
  handleMarkAsConfirmed = (Hole) => {                                                                               // When existing Hole is marked as confirmed repaired by Evaluator
      this.setState({                                                                                               // Update local GUI
        holes: this.state.holes.map(hole => {
          if(hole.id === Hole.id) {
            hole.isConfirmed = true;
          }
          return hole;
        })
      });

      this.upDateHole(Hole.id, Hole);                                                                               // Update Colony
  }
  handleMarkerPosition = (Lat, Lng) => {                                                                            // Adjust map center when user clicks on an existing record
    this.setState({
      mapCenter: { lat: Lat, lng: Lng }
    })
  }
  render() {
    const holes = this.state.holes;
    const compAdd = this.state.companyAddress.address;
    const userAdd = this.state.userAddress.address;
    const mapCenter = this.state.mapCenter;

    return (
      <div>
          <h1>POT HOLE HUNTER</h1>
          <div>
            <HoleMap recordHole={hole => this.recordHole(hole)} existingHoles={holes} centerLocation={mapCenter}/>
          </div>
          <h2>Set-Up</h2>
            <p>For this demo we assume:</p>
            <p>User is account(0): {userAdd}</p>
            <p>Company/worker is account(1): {compAdd}</p>
          <div>
            <h2>Recorded Holes</h2>
            <HoleTable
              onLocationClick={this.handleMarkerPosition}
              holes={holes}
              onRepairedClick={this.handleMarkAsRepaired}
              onConfirmedClick={this.handleMarkAsConfirmed}
              />
          </div>
      </div>
    );
  }
}
