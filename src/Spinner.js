import React from 'react'

import spinner from "./spinner.svg"

export default class Spinner extends React.Component {
  render() {
    return (
      <div style={{height: 200}}>
        <img
          width={28} src={spinner}
          style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', marginTop: 86}}
        />
      </div>
    )
  }
}
