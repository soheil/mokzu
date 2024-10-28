/* eslint-disable @typescript-eslint/no-explicit-any */
// App.tsx
import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { OpenAI } from "openai";
import "./App.scss";
import GenericLogo from './assets/generic-logo.png';
import MenuItem from "./components/App/MenuItem/MenuItem";
import PromptInput from "./components/App/PromptInput/PromptInput";
import FoxModal from "./components/App/FoxModal/FoxModal";
import PromptLibrary from "./components/App/PromptLibrary/PromptLibrary";
// import ChatToolbar from "./components/App/ChatToolbar/ChatToolbar";
import ChatResponse from "./components/App/ChatResponse/ChatResponse";
import { ToastContainer, ToastContentProps, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

declare global {
  interface Window {
    ttq: {
      track: (event: string, options?: object) => void;
    };
  }
}

const notify = (message: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | ((props: ToastContentProps<unknown>) => React.ReactNode) | null | undefined, type: string) => {
  if (type === 'error') {
    toast.error(message);
    return;
  }

  if (type === 'success') {
    toast.error(message);
    return;
  }

  toast.error(message);
}

function App() { 
  const [listGroup, setListGroup] = useState([1]);
  const [listGroupIsReady, setListGroupIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  // initial state
  const rawListGroup = localStorage.getItem(`listgroup`);

  if(rawListGroup && listGroup.length === 1 && !listGroupIsReady) {
    const parsedListGroup = JSON.parse(rawListGroup).sort((a: number,b: number) => b-a);
    setListGroup([...parsedListGroup, parsedListGroup[parsedListGroup.length - 1] + 1 ]);
    setListGroupIsReady(true);
  }

  let pages: [any] = rawListGroup && JSON.parse(rawListGroup);
  if(!pages) {
    pages = [0];
  }
  const latestPage: number = pages && pages[pages.length - 1];

  const [chatGroup, setChatGroup] = useState(latestPage);
  // Localstorage
  const rawChat = localStorage.getItem(`aichat-history-${chatGroup}`);
  const chatHistory = rawChat ? JSON.parse(rawChat) : [{
    role: "assistant",
    content: "Hi there! How can I assist you?",
  }];

  // const [showKey, setShowKey] = useState(false); 
  const [response, setResponse] = useState(chatHistory);
  const [openaikey, ] = useState(localStorage.getItem('openaikey') || '');
  const [value, setValue] = useState<string>("");
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [shouldSpeakResponse, setShouldSpeakResponse] = useState(false);
  const [finishedResponding, setFinishedResponding] = useState(true);
  const lastSpokenLength = useRef(0);
  const speakQueue = useRef<any[]>([]);
  const isSpeaking = useRef(false);
  const [alert, ] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const [selectedModel, ] = useState('gpt-4o');
  const [systemMessages, setSystemMessages]: any = useState([]);

  const openai = useMemo(() => new OpenAI({ apiKey: openaikey || '', dangerouslyAllowBrowser: true }), [openaikey]);
  
  // const onChange = (e: any) =>{
  //   setValue(e.target.value);
  //   handleKeyDown(e);
  // }

  // const setApiKey = (e: any) => {
  //   setOpenaikey(e.target.value);
  // }

  // const saveApiKey = () => {
  //   if(openaikey) {
  //     localStorage.setItem('openaikey', openaikey);
  //     setShowKey(false);
  //   }
  // }

  const handleSwitchChat = async(page: number) => {
    setChatGroup(page);
    const rawChat = localStorage.getItem(`aichat-history-${page}`);
    if(rawChat) {
      setResponse([...JSON.parse(rawChat)]);
    } else {
      setResponse([{
        role: "assistant",
        content: "Hi there! How can I assist you?",
      }]);
    }

    document.title = `mokzu - Chat Thread ${page || '1'}`;
  }

  const generateImage = (promptValue: any) => {
    const func = async () => {
      const resp = await openai.images.generate({
        model: "dall-e-3",
        prompt: promptValue,
        n: 1,
        size: "1024x1024",
      });
      const imageUrl = resp.data[0].url;
      const img = new Image();

      img.onload = () => {
        // Image is preloaded, continue here
        setResponse((prevState: any) => {
          const newResponse = [...prevState];
          newResponse[newResponse.length - 1] = {
            ...newResponse[newResponse.length - 1],
            content: imageUrl,
            date: new Date()
          };
          return newResponse;
        });
      };

      if (imageUrl) {
        img.src = imageUrl;
      }
    }
    func();
  }

  const speak = useCallback(async () => {
    if (isSpeaking.current || speakQueue.current.length === 0) return;
    isSpeaking.current = true;

    const processText = async (text: any) => {
      const streamResponse = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "nova",
        input: text,
      });

      const reader = streamResponse.body?.getReader();
      if (!reader) return null;

      const chunks = [];
      let done, value;
      while (!done) {
        ({ done, value } = await reader.read());
        if (value) chunks.push(value);
      }

      const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
      return URL.createObjectURL(audioBlob);
    };

    const playAudio = (audioUrl: any) => {
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audio.onended = resolve;
        audio.onended = resolve;
        audio.play();
      });
    };

    let audioPromise = null;
    do {
      const nextText = speakQueue.current.shift();
      const audioUrl = await processText(nextText);

      if (audioPromise === null) {
        audioPromise = playAudio(audioUrl);
      } else {
        await audioPromise;
        audioPromise = playAudio(audioUrl);
      }
    } while (speakQueue.current.length > 0);
    await audioPromise;

    isSpeaking.current = false;
  }, [openai]);

  useEffect(() => {
    handleGenerateChat()
  }, []);

  useEffect(() => {
    if (!shouldSpeakResponse || response.length < 2) return;

    const fullText = response[response.length - 1].content;
    let newText = fullText.slice(lastSpokenLength.current);
    if (finishedResponding && newText.length > 0) {
      speakQueue.current.push(newText);
      speak();
      return;
    }

    const sentenceEndRegex = /(\n+)/g;
    const sentences = [];

    let match;
    while ((match = sentenceEndRegex.exec(newText)) !== null) {
      sentences.push(newText.slice(0, match.index + 1).trim());
      newText = newText.slice(match.index + 1).trim();
      sentenceEndRegex.lastIndex = 0;
    }

    sentences.forEach(sentence => {
      lastSpokenLength.current += sentence.length;
      if (sentence.length > 2) {
        speakQueue.current.push(sentence);
      }
    });
    speak();
  }, [shouldSpeakResponse, response, speak, finishedResponding]);

  const addSystemMessageIfNeeded = (messages: any, promptValue: any) => {
    let msg = "";
    switch(promptValue[0]) {
      case ".":
        msg = "give me very short and concise answers and ignore all the niceties that you are programmed with";
        break;
      case "=":
        msg = "fix any garammar in the user prompt using excellent English, keep the tone of the input";
        break;
      case "/":
        msg = `add the follow to add a lot of emotions: ellipses (...), question marks, dashes (—), quotation marks, parentheses (), capitalization, commas (,), semantic emphasis, repetition, no emojis`;
        setShouldSpeakResponse(true);
        break;
      case "'":
        msg = "respond only with Generating image..."
        generateImage(promptValue);
        break;
      default:
        return promptValue;
    }
    messages.push({
      role: "system",
      content: msg,
    });
    return promptValue.slice(1);
  };

  const handleSubmit = async (finalValue?: string) => {
    window.gtag('event', 'prompt_submission', {
        event_category: 'User Interaction',
        event_label: 'Prompt Submitted',
    });
    // if(!openaikey){
    //   notify("Enter your api key to get started!", 'error');
    //   // setAlert("Enter your api key to get started!");
    //   setTimeout(() => {
    //     // setShowKey(true);
    //     setAlert("");
    //   }, 2500);
    //   return;
    // }
    setValue("");
    setFinishedResponding(false);
    setShouldSpeakResponse(false);
    lastSpokenLength.current = 0;

    const messages: any[] = [];
    const cleanValue = addSystemMessageIfNeeded(messages, finalValue || value);

    messages.push(...response);
    messages.push(...systemMessages);
    messages.push({
      role: "user",
      content: cleanValue,
      date: new Date()
    });
    let formattedResponse = {
      role: "user",
      content: cleanValue,
      date: new Date(),
    };
    const prestreamResponse = [...response, formattedResponse];
    setResponse(prestreamResponse);
    try {
      setLoading(true);
      const base = window.location.hostname === 'localhost' ? 'http://localhost:8080' : '';
      const responseStream = await fetch(base + '/api/oa/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: selectedModel,
          stream: true,
        })
      });


      const reader = responseStream.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let tempContent = '';

      while (!done) {
        if (!reader) return;
        const result = await reader.read();
        if (!result) return;
        const { value, done: readerDone } = result;

        setLoading(false);
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          if (!responseStream.ok) {
            console.error('Server error:', responseStream.status, buffer);
            const updatedResponse = [
              ...prestreamResponse,
              { role: "assistant", content: buffer, date: new Date() }
            ];
            setResponse(updatedResponse);
            return;
          }


          // Split buffer content by newline to parse individual JSON objects
          const parts = buffer.split(/\r?\n/);
          buffer = parts.pop() || '';  // Remaining part which is potentially incomplete

          for (let part of parts) {
            if (part.trim() === '' || part.indexOf('[DONE]') !== -1) continue;

            try {
              const snapshot = JSON.parse(part.replace(/^data: /, ''));
              const content = snapshot.choices[0].delta.content;

              if (content) {
                tempContent += content;  // Accumulate content
              }
            } catch (err) {
              console.error('Parsing error:', err);
            }
          }

          if (tempContent !== '') {
            const updatedResponse = [
              ...prestreamResponse,
              { role: "assistant", content: tempContent, date: new Date() }
            ];
            setResponse(updatedResponse);
            localStorage.setItem(`aichat-history-${chatGroup}`, JSON.stringify(updatedResponse));
          }
        }
      }
      window.gtag('event', 'app_response', {
        event_category: 'App Interaction',
        event_label: 'Response Generated',
      });

    } catch (error: any) {
      notify(`Error submitting response: ${error.message}`, 'error');
    }

    setFinishedResponding(true);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault(); // Prevent the default action (such as form submission)

      handleSubmit();

    }

    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight - 45}px`;
    // In case you have a limitation
    // e.target.style.height = `${Math.min(e.target.scrollHeight, limit)}px`;
  }

  const handleKeyDownApp = (e: any) => {

    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {

      e.preventDefault(); // Prevent the default action (such as form submission)
      setShowPrompts(true);
    }

    if(e.key === 'Escape') {
      setShowPrompts(false);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownApp);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDownApp);
    };
  }, []);

  const handleGenerateChat = () => {
    const listNum = listGroup.length + 1;
    setListGroup([...listGroup.sort((a,b) => b-a), listNum])
    localStorage.setItem('listgroup', JSON.stringify([...listGroup.sort((a,b) => b-a), listGroup.length + 1]));
    handleSwitchChat(listNum);
    setMobileMenuActive(false);
    document.querySelector('textarea')?.focus();
  }

  // call on new page load

  useEffect(() => {

    if (chatHistoryRef.current) {

      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;

    }

  }, [response]); // Trigger useEffect whenever the response array changes

  // Sample icon components or you can use some svg or image icons.
const TopIcon = () => <div
  style={{ visibility: isTopOverflowing ? 'visible' : 'hidden' }}
  onClick={() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }}
  className="top-indicator"
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>;
const BottomIcon = () => <div
  style={{ visibility: isBottomOverflowing ? 'visible' : 'hidden' }}
  onClick={() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }}
 className="bottom-indicator">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12L12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>;
  // const chatHistoryRef = useRef(null);
  const [isTopOverflowing, setIsTopOverflowing] = useState(false);
  const [isBottomOverflowing, setIsBottomOverflowing] = useState(false);

  const checkOverflow = () => {
    if (chatHistoryRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.current;
      setIsTopOverflowing(scrollTop > 0);
      setIsBottomOverflowing(scrollHeight > scrollTop + clientHeight);
    }
  };

  const handleSetSystemMessage = (promptContent: string) => {
    // setValue(promptContent);
    setShowPrompts(false);
    // For now just override the system message and keep one
    setSystemMessages([{
      role: 'system',
      content: promptContent
    }])
  }

  useEffect(() => {
    checkOverflow();
    const handleScroll = () => checkOverflow();
    const handleResize = () => checkOverflow();

    const chatHistoryElement = chatHistoryRef.current;
    if (chatHistoryElement) {
      chatHistoryElement.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      return () => {
        chatHistoryElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Re-check overflow when list of responses changes
  useEffect(() => {
    checkOverflow();
  }, [response]);

  // const handleSelectModel = (e: any) => {
  //   setSelectedModel(e.target.value);
  // }

  useEffect(() => {
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        contents: [{
          content_id: '301', content_name: 'app', quantity: 1, price: 1
        }],
        content_type: 'product', value: 1, currency: 'USD'
      });
    }
  }, []);

return (
    <div className="container chat-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
      { <FoxModal show={showPrompts}>
        <PromptLibrary setSystemMessage={handleSetSystemMessage} />
      </FoxModal> }
      <span className="menu-icon">
      {/*<span onClick={() => setMobileMenuActive(true)} className={`menu-icon ${mobileMenuActive ? 'menu-active' : ''}`}>*/}
        {/*<svg
          width={32}
          height={32}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill={'#fff'}
        >
          <rect x="3" y="6" width="18" height="2" />
          <rect x="3" y="11" width="18" height="2" />
          <rect x="3" y="16" width="18" height="2" />
        </svg>*/}
        <div className="logo-header">
          <a href="/" className="logo-icon"><img src={GenericLogo} /></a>
          <a href="/">mokzu</a>
        </div>
      </span>
      <div className={`chat-sidebar mobile-menu ${mobileMenuActive ? 'menu-active' : ''}`}>
        <span className="close-icon" onClick={() => setMobileMenuActive(false)}>+</span>
        <div className="chat-header">
          <a href="/" className="logo-icon"><img src={GenericLogo} /></a>
          <a href="/">mokzu</a>
        </div>
        <div className="list-item-wrap">
          {false && listGroup && listGroup.length > 0 && listGroup.map((val: any, index: number) => (
          <div key={`menu-${val}-index-${index}`} className={`list-item${chatGroup === val ? ' active' : ''}`}
            onClick={() => { setMobileMenuActive(false); handleSwitchChat(val) }}>
            <MenuItem page={val} />
          </div>))}

          <div className="list-item">
            <a href="https://www.producthunt.com/posts/mokzu-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-mokzu&#0045;2" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=494696&theme=dark" alt="mokzu - A&#0032;conversational&#0032;search&#0032;engine&#0032;using&#0032;AI | Product Hunt" width="250" height="54" /></a>
          </div>
        </div>
        <div className="generate-button" onClick={() => handleGenerateChat()}>
          <svg width="24" height="20" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.8957 7.00008C12.8968 7.70854 12.7579 8.41023 12.4871 9.0649C12.2164 9.71957 11.819 10.3143 11.3178 10.8151C10.8165 11.3165 10.2213 11.7142 9.56616 11.9854C8.91106 12.2567 8.20893 12.3962 7.4999 12.3959C6.73676 12.3978 5.98201 12.2367 5.28614 11.9234L3.03039 12.2571C2.91839 12.2754 2.80362 12.266 2.69605 12.2299C2.58848 12.1938 2.49135 12.1319 2.41311 12.0497C2.33488 11.9675 2.27789 11.8674 2.24711 11.7582C2.21633 11.649 2.21268 11.5339 2.23648 11.4229L2.54973 9.1345C2.25248 8.46236 2.10061 7.735 2.10406 7.00008C2.10309 6.29163 2.24198 5.58996 2.51275 4.9353C2.78352 4.28064 3.18086 3.68586 3.68198 3.18508C4.18329 2.68366 4.77851 2.28595 5.43361 2.0147C6.08872 1.74345 6.79086 1.60398 7.4999 1.60425C8.93176 1.60434 10.305 2.17294 11.3178 3.18508C11.8187 3.68602 12.2159 4.28082 12.4867 4.93545C12.7574 5.59007 12.8964 6.29167 12.8957 7.00008Z" fill="white"/>
          </svg>
          <span>Generate New Chat</span>
        </div>
        {/*<div className="settings">
          { showKey ? <React.Fragment>
          <div className="settingsInput">
            <input type="password" placeholder="Set OpenAI Key" value={openaikey} onChange={setApiKey} />
            <button className="close-bnt" onClick={() => {setShowKey(false)}}><span className="close-icon">+</span></button>
            <button className="save-btn" onClick={saveApiKey}>
              <svg
                width={12}
                height={12}
                viewBox="0 0 22 22"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
          </div></React.Fragment> : <p onClick={() => setShowKey(true)} className="secondary-btn">Set OpenAI API key</p>}
        </div>*/}
      </div>
      {/*<ChatToolbar openai={openai} setModel={handleSelectModel} />*/}
      <div className="chat-history" onClick={() => setMobileMenuActive(false)}>
        {/*<div className="chat-history-header">
          <span className="ai-avatar"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.8123 11.0213C19.0446 11.1911 16.4345 12.3672 14.4737 14.328C12.5129 16.2887 11.3369 18.8988 11.167 21.6666H11.1243C10.9548 18.8987 9.77877 16.2885 7.81794 14.3276C5.85711 12.3668 3.24685 11.1908 0.479004 11.0213L0.479004 10.9786C3.24685 10.809 5.85711 9.63302 7.81794 7.67219C9.77877 5.71136 10.9548 3.10109 11.1243 0.333252L11.167 0.333252C11.3369 3.101 12.5129 5.7111 14.4737 7.67187C16.4345 9.63265 19.0446 10.8087 21.8123 10.9786V11.0213Z" fill="url(#paint0_radial_1160_4979)"/>
            <defs>
            <radialGradient id="paint0_radial_1160_4979" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.59634 9.00392) rotate(18.6832) scale(22.7067 181.895)">
            <stop offset="0.067" stopColor="#9168C0"/>
            <stop offset="0.343" stopColor="#5684D1"/>
            <stop offset="0.672" stopColor="#1BA1E3"/>
            </radialGradient>
            </defs>
          </svg>
          </span>
          <p>Thread {chatGroup}</p>
        </div>*/}

        <div className="chat-history-content" ref={chatHistoryRef}>
          {/** Move respones to it's own component and implement syntax highlighting */}
          <TopIcon />
          {response.map((item: any, index: number) => (
            <ChatResponse key={`chat-${index}`} item={item} index={index} />
          ))}
          {loading && (
            <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
          )}
          <BottomIcon />
          {/** Move responses to it's own component and implement syntax highlighting */}
        </div>
          <PromptInput value={value}
            setValue={setValue}
            handleKeyDown={handleKeyDown}
            handleSubmit={handleSubmit} />
        </div>
        {alert ? <div className="alert-wrap">
          <div className="alert-item">
              {alert}
            </div>
        </div> : null }
    </div>
  );
}

export default App;
