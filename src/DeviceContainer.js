import React from 'react';

import Wallet from "./Wallet";
import { readDevice } from "./usbUtils"

export default class DeviceContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sealedState: 'unknown',
      paymentAddress: null,
      privateKey: null
    }
  }

  componentDidMount() {
    // ensure the device is open
    let device = this.props.device;

    device.open().then(() => {
      this._fetchState();
    })
  }

  _fetchState() {
    // read pub key from device to check if it's fresh
    // read priv key from device to check if it's unsealed
    let device = this.props.device;
    let getPaymentAddr = readDevice(device, 3);
    let getPrivKey = readDevice(device, 1);

    Promise.all([getPaymentAddr, getPrivKey]).then(result => {
      console.log(result);
      if (result[0].data.byteLength === 0 && result[1].data.byteLength === 0) {
        this.setState({
          sealedState: 'fresh'
        })
      } else if (result[0].data.byteLength > 0 && result[1].data.byteLength === 0) {
        this.setState({
          paymentAddress: result[0].data,
          sealedState: 'sealed'
        })
      } else {
        this.setState({
          paymentAddress: result[0].data,
          privateKey: result[1].data,
          sealedState: 'unsealed'
        })
      }

    }).catch(err => {
      console.error(err);
      alert(err.message);
    })
  }

  render() {
    const { device } = this.props;
    const { paymentAddress, privateKey, sealedState } = this.state;

    return this.props.children({
      paymentAddress, privateKey, sealedState
    })
  }
}
