import React, { Component } from 'react';

class Numbers extends Component {

  constructor(props) {
    super(props);
    this.state = { type: props.statement };
    this.createButtons = this.createButtons.bind(this);
  }

  createButtons() {
    let buttons = [];
    for (let i = 0; i < 10; i++) {
      var rowNum = i / 5 + 1;
      var colNum = i % 5 + 1;
      var number = i;
      var className = "entry-wide row" + rowNum + " col" + colNum;
      buttons.push(<button className={className}>{number}</button>);
      if (i !== 0 && (i+1) % 5 === 0) {
        buttons.push(<br />)
      }
    }
    return buttons;
  }

/*
  render() {
    return (
      <div className="userInput">
        <button className="entry-wide">0</button>
        <button className="entry-wide">1</button>
        <button className="entry-wide">2</button>
        <button className="entry-wide">3</button>
        <button className="entry-wide">4</button>
        <br />
        <button className="entry-wide">5</button>
        <button className="entry-wide">6</button>
        <button className="entry-wide">7</button>
        <button className="entry-wide">8</button>
        <button className="entry-wide">9</button>

      </div>
    )
  }
  */

  render() {
    return (
      <div className="userInput">
        {this.createButtons()}
      </div>
    )
  }
}

export default Numbers;
