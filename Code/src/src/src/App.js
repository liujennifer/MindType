import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { getRandomArray } from './helpers/shuffle';

import Letters from './components/LetterComponent';
import Numbers from './components/NumberComponent';
import Emojis from './components/EmojiComponent';

// Getting rows
const row1 = document.getElementsByClassName('row1');
const row2 = document.getElementsByClassName('row2');
const row3 = document.getElementsByClassName('row3');
const row4 = document.getElementsByClassName('row4');
const row5 = document.getElementsByClassName('row5');
const rows = [row1, row2, row3, row4, row5];

// Getting Columns
const col1 = document.getElementsByClassName('col1');
const col2 = document.getElementsByClassName('col2');
const col3 = document.getElementsByClassName('col3');
const col4 = document.getElementsByClassName('col4');
const col5 = document.getElementsByClassName('col5');
const col6 = document.getElementsByClassName('col6');
const cols = [col1, col2, col3, col4, col5, col6];

let prev = rows[0];
let curRow = 0; // Keeping track of which array index you're on for random rows.
let curCol = 0; // Keeping track of which array index you're on for random cols.

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statement: '',
      display: 'letters',
      displayText: '',
      interval : null,
      lettersFound : 0,
      rowOrder : null,
      colOrder : null,
      rowFound : false,
      colFound : false
    };
    this.handleNumClick = this.handleNumClick.bind(this);
    this.handleEmojiClick = this.handleEmojiClick.bind(this);
    this.handleLetterClick = this.handleLetterClick.bind(this);
    this.writePhrase    = this.writePhrase.bind(this);
  }

  handleNumClick() {
    this.setState({ display: 'numbers' });
  }

  handleEmojiClick() {
    this.setState({ display: 'emojis' })
  }

  handleLetterClick() {
    this.setState({ display: 'letters' });
  }

  writePhrase() {
    const {statement, interval, lettersFound, rowOrder,
      colOrder, rowFound, colFound, displayText} = this.state;
    if (lettersFound === statement.length) {
      clearInterval(interval);
    } else {
      for (let j = 0; j < prev.length; j++) {
        prev[j].style.backgroundColor = '#3da8c4';
        prev[j].style.color = 'white';
        prev[j].style.fontWeight = 'normal';
      }
      // making sure rows/cols don't flash if they've already been found.
      let rc;
      if (rowFound) rc = 2;
      else if (colFound) rc = 1;
      else rc = Math.floor((Math.random() * 2) + 1);

      if (rc === 1) {
        const row = rows[rowOrder[curRow]];
        prev = row;
        curRow = curRow + 1;
        let rowIdx = -1;
        // Handling Spaces
        if (statement[lettersFound] === ' ' && row === rows[4]) {
          const rowOrder = getRandomArray(5);
          curRow = 0;
          this.setState({rowFound : true, rowOrder});
        }
        for (let j = 0; j < row.length; j++) {
          // Flash styles
          row[j].style.backgroundColor = 'white';
          row[j].style.color = '#3da8c4';
          if (row[j].innerHTML === statement[lettersFound]) {
            rowIdx = j;
            const rowOrder = getRandomArray(5);
            curRow = 0;
            this.setState({rowFound : true, rowOrder});
          }
        }
        if (colFound && rowIdx >= 0) {  // rowIdx >= 0 implies a letter has been found
          for (let j = 0; j < row.length; j++) {
            if (j === rowIdx) {
              // "letter found" styles
              row[j].style.color = 'red';
              row[j].style.fontWeight = 'bold';
            } else {
              // Apply the default styles to other character
              row[j].style.backgroundColor = '#3da8c4';
              row[j].style.color = 'white';
            }
          }
        }
      } else {
        const col = cols[colOrder[curCol]];
        prev = col;
        curCol = curCol + 1;
        let colIdx = -1;
        // Handling Spaces
        if (statement[lettersFound] === ' ' && col === cols[0]) {
          const colOrder = getRandomArray(6);
          curCol = 0;
          this.setState({colFound : true, colOrder});
        }
        for (let j = 0; j < col.length; j++) {
          // Flash styles
          col[j].style.backgroundColor = 'white';
          col[j].style.color = '#3da8c4';
          if (col[j].innerHTML === statement[lettersFound]) {
            colIdx = j;
            const colOrder = getRandomArray(6);
            curCol = 0;

            this.setState({colFound : true, colOrder});
          }
        }
        if (rowFound && colIdx >= 0) { // colIdx >= 0 implies a letter has been found
          for (let j = 0; j < col.length; j++) {
            if (j === colIdx)  {
              // "letter found" styles
              col[j].style.color = 'red';
              col[j].style.fontWeight = 'bold';
            } else {
              // Apply the default styles to other character
              col[j].style.backgroundColor = '#3da8c4';
              col[j].style.color = 'white';
            }
          }
        }
      }
      // If a letter has been found.
      if (rowFound && colFound) {
        [curRow, curCol] = [0, 0];
        const newDisplay = displayText + statement[lettersFound];
        this.setState({rowFound : false, colFound : false,
        displayText : newDisplay, lettersFound : lettersFound + 1});
      }
    }
  }

  componentDidMount() {
    const statement = prompt("What would you like to type?");
    const rowOrder = getRandomArray(5);
    const colOrder = getRandomArray(6);
    const interval = setInterval(this.writePhrase, 500);
    this.setState({interval, statement, rowOrder, colOrder});
  }

  /*
  get phrase from user
  pass phrase into app component
  for loop the phrase (function)
  pass the letter to letter function
  generate random rows and columns and highlight them
  check if letter in each row or column
  store in row selected and colulmn selected variables
  return letter to parent, put it on screen
  */

  render() {
    let element;
        let button2;
        let button3;
        if (this.state.display === 'letters') {
          element = <Letters />;
          button2 = <button onClick={this.handleNumClick} className="option">0</button>
          button3 = <button onClick={this.handleEmojiClick} className="option">:)</button>
        } else if (this.state.display === 'numbers') {
          element = <Numbers />;
          button2 = <button onClick={this.handleLetterClick} className="option">abc</button>
          button3 = <button onClick={this.handleEmojiClick} className="option">:)</button>
        } else {
          element = <Emojis />;
          button2 = <button onClick={this.handleNumClick} className="option">0</button>
          button3 = <button onClick={this.handleLetterClick} className="option">abc</button>
        }
    return (
      <div>
        <input type="text" className="display" value={this.state.displayText} readOnly></input>
        <button className="resume">Resume</button>
        <div className="suggestions">
          <button className="suggestion">To</button>
          <button className="suggestion">That</button>
          <button className="suggestion">The</button>
        </div>
        {element}
        <div className="options">
          <button className="option">.</button>
          {button2}
          {button3}
          <button className="option">&crarr;</button>
          <button className="option">&#8678;</button>
        </div>
      </div>
    );
  }
}

export default App;
