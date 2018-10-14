
export function readDevice(device, code) {
  // bmRequestType: 0xc0
  // 1 10 00000
  var setup = {
    requestType: "vendor",
    recipient: "device",
    request: 0,
    value: code,
    index: 0,
  }
  return device.controlTransferIn(setup, 500)
}

export function writeDevice(device, code, data) {
  // bmRequestType: 0x40
  // 0 10 00000
  var setup = {
    requestType: "vendor",
    recipient: "device",
    request: 0,
    value: code.charCodeAt(0),
    index: 0,
  }
  return device.controlTransferOut(setup, data)
}
