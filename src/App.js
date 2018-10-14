import React from 'react'

import DeviceContainer from "./DeviceContainer";
import Wallet from "./Wallet"
import Spinner from "./Spinner"

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: null
    }
    this._connectOpendime = this._connectOpendime.bind(this)
  }

  componentDidMount() {
    navigator.usb.onconnect = (evt) => {
      console.log('connected', evt);
      this.setState({device: evt.device});
    }

    navigator.usb.ondisconnect = (evt) => {
      console.log('disconnected', evt)
      this.setState({device: null});
    }

    setInterval(() => {
      this._findDevice();
    }, 500);

    this._findDevice();
  }

  _findDevice() {
    if (this.state.device === null) {
      navigator.usb.getDevices().then(devices => {
        if (devices.length > 0) {
          this.setState({
            device: devices[0]
          })
        }
      })
    }
  }

  _connectOpendime(e) {
    e.preventDefault();

    navigator.usb.requestDevice({ filters: [{ vendorId: 0xd13e }] })
    .then(selectedDevice => {
      this.setState({
        device: selectedDevice
      })
    })
    .catch(error => {
      console.error(error);
      alert(error.message);
    })
  }

  _renderDevice(device) {
    if (device) {
      return <DeviceContainer device={this.state.device}>{ ({paymentAddress, privateKey, sealedState}) => {
        if (sealedState === 'unknown') {
          return <Spinner />;
        } else if (sealedState === 'fresh') {
          return (<div className="alert alert-success" role="alert" style={{ margin: 10 }}>
            <h5 className="alert-heading">The Opendime is new and unused. </h5>
              <p>Please open file <strong>index.htm</strong> inside and follow the instructions.</p>
          </div>)
        } else {
          return (
              <Wallet
                  device={device}
                  paymentAddress={paymentAddress}
                  privateKey={privateKey}
              />
          )
        }
      }}</DeviceContainer>
    } else {
      return (<div className="card-body">
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={this._connectOpendime}>
          <i className="fas fa-plug"></i> Connect Opendime
        </button>
        <hr />
        <p>
          <span className="font-italic">or </span>
          <a target="_blank" href="https://opendime.com/">buy one</a> if you don't have any.
        </p>
      </div>)
    }
  }

  render() {
    const { device } = this.state;
    return (
      <div className="container">
        <div className="row justify-content-center" style={{ marginTop: 85 }}>
          <div className="card justify-content-center" style={{width: '25rem'}}>
          <div className="card-header">
            <span style={{ fontSize: 25, fontFamily: 'K2D, sans-serif', color: '#757474'}}>
              EthDime
            </span>
          </div>
          { this._renderDevice(device) }
          </div>
        </div>
        <div className="row">
          <div className="mx-auto text-muted text-center" style={{height: 75, width: 300, marginTop: 100}}>
            <i className="fab fa-github"></i>{ " " }
            <a className="text-muted" target="_blank" href="https://github.com/tyrelldev/ethdime">View Source</a>
          </div>
        </div>
      </div>
    )
  }
}
