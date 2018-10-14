import React from 'react';
import { Buffer } from 'buffer';
import makeBlockie from 'ethereum-blockies-base64';
import QRCode from 'qrcode.react';

import { readDevice, writeDevice } from "./usbUtils"
import { recoverPubKey, createEthAddress } from "./crypto"
import copyToClipboard from "./copyToClipboard";
import Spinner from "./Spinner"


class Balance extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      balance: null
    }
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'production') {
      this._fetchBalance();
    }
  }

  _fetchBalance() {
    const url = `http://api.ethplorer.io/getAddressInfo/${this.props.address}?apiKey=freekey`
    fetch(url).then(resp => resp.json()).then(data => {
      this.setState({
        balance: data.ETH.balance
      })
    })
  }

  render() {
    if (this.state.balance !== null) {
      return `${this.state.balance} ETH`
    } else {
      return "? ETH "
    }
  }
}

class PrivateKeySection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      revealPrivateKey: false
    }
    this._toggleDisplay = this._toggleDisplay.bind(this)
  }

  _toggleDisplay(e) {
    e.preventDefault()

    this.setState({
      revealPrivateKey: !this.state.revealPrivateKey
    })
  }

  render() {
    const { revealPrivateKey } = this.state;
    const { privateKey } = this.props;

    const hexPrivKey = new Buffer(privateKey.buffer).toString('hex');

    return [
      <hr key="sep1"/>,
      <div className="card-body" key="div1">
        <h5 className="card-title">Private Key</h5>
        <div className="card-text">
          <a href="#" onClick={this._toggleDisplay} className="btn btn-secondary">
            {
              revealPrivateKey
              ? [<i key="icon" className="fas fa-eye-slash"></i>, "  Hide Private Key"]
              : [<i key="icon" className="fas fa-eye"></i>, "  Reveal Private Key"]
            }
          </a>
          {
            revealPrivateKey && <div style={{ paddingTop: 20 }}><p className="text-monospace">{ hexPrivKey }</p></div>
          }
          {
            revealPrivateKey && <div style={{ paddingTop: 20 }}>
              <QRCode style={{height:128, width:128}} value={ hexPrivKey } />
            </div>
          }
        </div>
      </div>
    ]
  }
}


export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pubKey: null,
      displayQRCode: false
    }
  }

  componentDidMount() {
    const { device } = this.props;

    var msg = new Uint8Array(32);
    crypto.getRandomValues(msg);

    writeDevice(device,'m', msg).then((result) => {
      // TODO add retry logic here
      setTimeout(() => {
        readDevice(device, 4).then(result => {
          var sig = result.data.buffer;
          var pubKey = recoverPubKey(new Buffer(msg), new Buffer(sig));
          this.setState({
              pubKey: pubKey
          })
        })
      }, 1000);
    })
  }

  _copyAddress(address) {
    var range = document.createRange();
    range.selectNode(document.getElementById('address'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    copyToClipboard(address);
  }


  render() {
    const { privateKey } = this.props;
    const { pubKey, displayQRCode } = this.state;
    let ethAddr = null;

    if (pubKey) {
      ethAddr = createEthAddress(pubKey);
    }

    return  pubKey ? (<React.Fragment>
          {
            privateKey && <div className="alert alert-danger" role="alert" style={{ margin: 10 }}>
                            <h5 className="alert-heading">This OpenDime is UNSEALED</h5>
                            <span><strong>DO NOT</strong> send more funds to this address or accept this hardware as payment</span>
                          </div>
          }
          <div className="mx-auto" style={{ paddingTop: 20 }}>
            <img className="rounded" width={80} src={ makeBlockie(ethAddr) }></img>
          </div>
          <div className="card-body">
            <h5 className="card-title">Address</h5>
            <div className="card-text">
              <p id="address" className="text-monospace">{ ethAddr }</p>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  this._copyAddress(ethAddr);
                }}
                className="btn btn-light btn-sm" href="#" role="button">
                <i className="far fa-copy"></i> Copy Address
              </a>
              { " " }
              <a
                onClick={(e) => {
                    e.preventDefault();
                    this.setState({displayQRCode: !displayQRCode})
                  }
                }
                className="btn btn-light btn-sm" href="#" role="button">
                 <i className="fas fa-qrcode"></i>
                { displayQRCode ? " Hide QR Code" : " Display QR Code" }
              </a>
              {
                displayQRCode && <div style={{ marginTop: 50 }}>
                  <QRCode style={{height:128, width:128}} value={ ethAddr } />
                </div>
              }
            </div>
          </div>
          { privateKey && <PrivateKeySection privateKey={privateKey} /> }
          <hr />
          <div className="card-body">
            <h5 className="card-title">Balance</h5>
            <p className="card-text">
              <Balance address={ ethAddr }/>
            </p>
            <a
              target="_blank"
              href={ `https://etherscan.io/address/${ethAddr}`}
              className="btn btn-outline-dark">
              View on Etherscan
            </a>
          </div>
        </React.Fragment>
    ) : <Spinner />;
  }
}
