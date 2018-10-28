import React, { Component } from 'react';

class Emojis extends Component {

  constructor(props) {
    super(props);
    this.state = { type: props.statement };
    this.createButtons = this.createButtons.bind(this);
  }

  createButtons() {
    let buttons = [];
    let emojiList = ['😄','😌','😀','😍','😎','😡','😅','😴','🙄','😲','😋',
      '😭','😈','😇','🤑','🤵','👰','🤳','🙈','🙉','🙊','🎅','❤️','💔'];
    for (let i = 0; i < 24; i++) {
      var rowNum = i / 6 + 1;
      var colNum = i % 6 + 1;
      var emoji = emojiList[i];
      var className = "entry row" + rowNum + " col" + colNum;
      buttons.push(<button className={className}>{emoji}</button>);
      if (i !== 0 && (i+1) % 6 === 0) {
        buttons.push(<br />)
      }
    }
    return buttons;
  }

  render() {
    return (
      <div className="userInput">
        {this.createButtons()}
      </div>
    )
  }
}
/*
  render(){
    return (
      <div className="userInput">
         <button className="entry">😄</button>
         <button className="entry">😌</button>
         <button className="entry">😀</button>
         <button className="entry">😍</button>
         <button className="entry">😎</button>
         <button className="entry">😡</button>
         <br />
         <button className="entry">😅</button>
         <button className="entry">😴</button>
         <button className="entry">🙄</button>
         <button className="entry">😲</button>
         <button className="entry">😋</button>
         <button className="entry">😭</button>
         <br />
         <button className="entry">😈</button>
         <button className="entry">😇</button>
         <button className="entry">🤑</button>
         <button className="entry">🤵</button>
         <button className="entry">👰</button>
         <button className="entry">🤳</button>
         <br />
         <button className="entry">🙈</button>
         <button className="entry">🙉</button>
         <button className="entry">🙊</button>
         <button className="entry">🎅</button>
         <button className="entry">❤️️</button>
         <button className="entry">💔</button>
      </div>
    )
  }
  */


export default Emojis;
