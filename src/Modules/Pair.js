import React from "react";


class Pair extends React.Component {
  
  constructor(props){
    super(props)
    this.state={
      id: this.props.id,
      translate: this.props.translate,
      index: this.props.index
    }
    this.changed = this.changed.bind(this)
  }
  
  changed( control ){
    let
      { onChange } = this.props,
      id = control.target.id.replace( 'tx-', '' );
    let data = {
      id: id,
      translate: control.target.value
    };
    onChange( data );
    this.setState( {
      translate: data.translate
    } )
  }
  
  render(){
    let{ index, translate, id } = this.state;
    return (
      <div className={"pair"}>
        <textarea className={"text-container disabled"} readOnly={true} id={"txo-" + index} key={"txo-" + index} defaultValue={id} />
        <textarea className={"text-container"} id={"tx-" + index} key={"txt-" + index} onChange={this.changed} defaultValue={translate} />
      </div>
    )
  }
  
}

export default Pair