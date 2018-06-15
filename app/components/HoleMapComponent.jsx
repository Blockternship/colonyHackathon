import React from 'react'
import { compose, withProps } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow} from 'react-google-maps'
import {FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';

const MyMapComponent = compose(
  withProps({
    googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAGtoy2vJnVJ8-EZj2cIp9T8Cvdsn3L6rU',
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '400px' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) =>
  <GoogleMap
    defaultZoom={15}
    defaultCenter={{ lat: 55.888215, lng: -3.427228 }}
    onClick={props.onMapClick}
  >
    {props.existingHoles.map(hole =>
      <Marker key={hole.id} position={ {lat: hole.location.lat, lng: hole.location.lng}}>
      </Marker>
    )}
    <Marker position={props.markerPosition}>
      <InfoWindow>
        <div>
          <h5>Drag The Pin To Mark Your Hole</h5>
          <form>
            <FormGroup>
              <FormGroup>
                <FormControl
                  type="text"
                  placeholder="Add Any Comments Here"
                  onChange={evt => props.onCommentChange(evt)}
                />
              </FormGroup>
              <FormControl.Feedback />
              <Button bsStyle="primary" onClick={props.onRecordClick}>RECORD</Button>
            </FormGroup>
          </form>
        </div>
      </InfoWindow>
    </Marker>
  </GoogleMap>
)

export default class HoleMap extends React.PureComponent {
  constructor(props) {
      super(props);
      this.state = {
        markerPosition: { lat: 55.888215, lng: -3.427228 },                                                   // Show marker in West Lothian on load
        comment: '',
      }
      console.log(props)
  }

  handleRecordClick = () => {                                                                                 // Save lat/lng & comment to ColonyNetwork
    console.log('Marker clicked: ' + this.state.markerPosition.lat + ',' + this.state.markerPosition.lng);
    console.log(this.state.comment);
    this.props.recordHole(this.state);
  }

  handleMapClick = (e) => {                                                                                   // Move marker to wherever the user has clicked on the map
    this.setState({
      markerPosition: { lat: e.latLng.lat(), lng: e.latLng.lng() }
    })
  }

  handleCommentChange = (e) => {                                                                              // Update state of the comment box for recording later
    this.setState({ comment: e.target.value })
  }

  render() {
    const existingHoles = this.props.existingHoles;
    return (
      <MyMapComponent
        markerPosition={this.state.markerPosition}
        onRecordClick={this.handleRecordClick}
        onMapClick={this.handleMapClick}
        onCommentChange={this.handleCommentChange}
        existingHoles={existingHoles}
      />
    )
  }
}
