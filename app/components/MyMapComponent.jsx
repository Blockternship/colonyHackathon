import React from 'react'
import { compose, withProps } from 'recompose'
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps'

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
    defaultZoom={8}
    defaultCenter={{ lat: -34.397, lng: 150.644 }}
    onClick={props.onMapClick}
  >
    {props.isMarkerShown && <Marker position={props.markerPosition} onClick={props.onMarkerClick}/>}
  </GoogleMap>
)

export default class MyFancyComponent extends React.PureComponent {
  constructor(props) {
      super(props);
      this.state = {
        isMarkerShown: true,
        markerPosition: { lat: -34.397, lng: 150.644 }
      }
  }

  componentDidMount() {
    // this.delayedShowMarker()
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 3000)
  }

  handleMarkerClick = () => {
    //this.setState({ isMarkerShown: false })
    //this.delayedShowMarker()
    console.log('Marker clicked: ' + this.state.markerPosition.lat + ',' + this.state.markerPosition.lng)
  }

  handleMapClick = (e) => {

    this.setState({
      isMarkerShown: true,
      markerPosition: { lat: e.latLng.lat(), lng: e.latLng.lng() }
    })
  }

  render() {
    return (
      <MyMapComponent
        isMarkerShown={this.state.isMarkerShown}
        markerPosition={this.state.markerPosition}
        onMarkerClick={this.handleMarkerClick}
        onMapClick={this.handleMapClick}
      />
    )
  }
}
