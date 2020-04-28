import React from 'react'
import Parser from "./Parser";

class FileLoader extends React.Component {
  constructor(props){
    super(props)
    this.state={
      files: [],
      allowed: this.props.allowed
    }
    this.Drop = this.Drop.bind(this)
    this.Change = this.Change.bind(this)
    this.DragOver = this.DragOver.bind(this)
  }
  
  Change( e ){
    this.setState({ files: e.target.files });
  }
  
  Drop( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    this.setState({ files: evt.dataTransfer.files });
  }
  
  DragOver( evt ) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }
  
  clickDrop(){
    document.getElementById('regular_file').click();
  }
  
  render() {
    let { files, allowed } = this.state;
    let output = [], f;
    let ts = Date.now();
    for ( let i = 0; i < files.length; i++ ) {
      f = files[i];
      if( ( ! f.type ) || ( allowed && allowed.indexOf( f.type ) < 0 ) )
        output.push(
          <li key={"file-list-item-" + i + ts} className={"file-item"}>
            <strong className={"error"}>{ escape( f.name ) }</strong>
            <span>{ f.type || 'n/a' } - </span>
            <span>{ f.size > 1024 ? Math.round( f.size / 1024 ) + 'Kb' : f.size + 'bytes' } bites, not allowed type</span>
          </li>
        );
      else
        output.push(
          <li key={"file-list-item-" + i + ts} className={"file-item"}>
            <strong>{ escape( f.name ) }</strong>
            <span>{ f.type || 'n/a' } - </span>
            <span>{ f.size > 1024 ? Math.round( f.size / 1024 ) + 'Kb' : f.size + 'bytes' }</span>
            <Parser file={f} />
          </li>
        );
    }
    let list = <ul>{output}</ul>;
    return (
      <div className={"dropper"}>
        <div id="drop_zone" className={ files.length ? "shrunk" : "ready" } onDragOver={this.DragOver} onDrop={this.Drop} onClick={this.clickDrop}>
          Drop *.po files here or click to select one...
        </div>
        <input type={"file"} id={"regular_file"} onChange={this.Change}/>
        <output id="list">{list}</output>
      </div>
    )
  }
}

export default FileLoader