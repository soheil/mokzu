import React, { useState } from 'react';
import Bowser from 'bowser';
import PromptOptions from '../PromptOptions/PromptOptions';
import './PromptInput.scss';

type PromptInputProps = {
  value: string,
  setValue: React.Dispatch<React.SetStateAction<string>>,
  handleSubmit: (e: string) => void,
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void,
};

type ShortCutProps = {
  letter?: string;
};


const ShortcutDisplay = ({ letter }: ShortCutProps) => {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const osName = browser.getOSName();

  const shortcutText = osName === 'macOS' ? `⌘ + ${letter}` : `Ctrl + ${letter}`;

  return <span className="operator">{shortcutText}</span>;
};

const PromptInput: React.FC<PromptInputProps> = ({ value, setValue, handleSubmit, handleKeyDown }) => {
  const [tone, setTone] = useState('');
  const [format, setFormat] = useState('');
  const [style, setStyle] = useState('');
  const [language, setLanguage] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const constructMessage = () => {
    let finalMessage = value;
    if (tone) finalMessage += ` [Tone: ${tone}]`;
    if (format) finalMessage += ` [Format: ${format}]`;
    if (style) finalMessage += ` [Style: ${style}]`;
    if (language) finalMessage += ` [Language: ${language}]`;
    handleSubmit(finalMessage);
  };
  return (
  <div className="promptBox">
    {/* <PromptOptions setTone={(tone: string) => {console.log(tone)}} /> */}
    { showOptions ? <PromptOptions setTone={setTone} setFormat={setFormat} setStyle={setStyle} setLanguage={setLanguage} /> : null }
    <div className="promptInnerBox">
      <div className='optionsIc___ons hidden'>
        <p onClick={() => setShowOptions(!showOptions)}>
          <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M9.36788 2.72409C9.31336 2.70001 9.25816 2.67686 9.20229 2.65472L8.83029 1.16675H6.16939L5.79738 2.65472C5.74151 2.67686 5.68631 2.70001 5.63179 2.72409L4.31583 1.93453L2.43426 3.81604L3.22388 5.13205C3.1998 5.18656 3.17664 5.24175 3.1545 5.29763L1.6665 5.66964V8.33054L3.15449 8.70254C3.17662 8.75841 3.19977 8.81361 3.22386 8.86812L2.43428 10.1841L4.31583 12.0657L5.63181 11.2761C5.68632 11.3002 5.74152 11.3233 5.79739 11.3454L6.16939 12.8334H8.83029L9.2023 11.3454C9.25817 11.3233 9.31336 11.3002 9.36787 11.2761L10.6839 12.0657L12.5654 10.1841L11.7758 8.86812C11.7999 8.81361 11.8231 8.75841 11.8452 8.70254L13.3332 8.33054V5.66964L11.8452 5.29763C11.823 5.24176 11.7999 5.18656 11.7758 5.13205L12.5654 3.81604L10.6838 1.93453L9.36788 2.72409ZM9.83317 7.00008C9.83317 8.28875 8.7885 9.33341 7.49984 9.33341C6.21117 9.33341 5.1665 8.28875 5.1665 7.00008C5.1665 5.71142 6.21117 4.66675 7.49984 4.66675C8.7885 4.66675 9.83317 5.71142 9.83317 7.00008Z" fill="white"/>
          </svg>
        </p>
      </div>
      <textarea
        placeholder="Message AI..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        onKeyDown={handleKeyDown}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(e:any) => {handleKeyDown(e)}}
      ></textarea>
      <button className="prompt-button" disabled={value.length === 0} onClick={constructMessage}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.01 21.99L23 12 2.01 2.01 2 10l15 2-15 2 .01 7.99z" fill="currentColor" />
        </svg>
      </button>
    </div>    
    <p className="keyboard-tip">
    {/*<ShortcutDisplay letter="S" /> for System Message | */}
    {/*<ShortcutDisplay letter="K" /> for Prompt Library | Shift + return to add a new line*/}
      <br />
{/*      Chat operators: 
      <span className="operator"> = </span> fix grammar (e.g., 
      <span> "=i can haz chiz?"</span>), 
      <span className="operator">.</span> brief answers, 
      <span className="operator">/</span> speak the result, 
      <span className="operator">'</span> generate image*/}
    </p>
  </div>
)};

export default PromptInput;
