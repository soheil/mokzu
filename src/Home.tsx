// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { OpenAI } from "openai";
import "./App.scss";
import GenericLogo from './assets/generic-logo.png';
import MenuItem from "./components/App/MenuItem/MenuItem";
import PromptInput from "./components/App/PromptInput/PromptInput";
import FoxModal from "./components/App/FoxModal/FoxModal";
import PromptLibrary from "./components/App/PromptLibrary/PromptLibrary";
import ChatResponse from "./components/App/ChatResponse/ChatResponse";
import { ToastContainer, ToastContentProps, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './LoadingSpinner';
// import Graph from './Graph';
import { useLocation } from 'react-router-dom';

const backendBase = window.location.hostname === 'localhost' ? 'http://localhost:8085' : '';
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() { 
  const [componentCode, setComponentCode] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const [listGroup, setListGroup] = useState([1]);
  const [listGroupIsReady, setListGroupIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const rawListGroup = localStorage.getItem(`listgroup`);

  const query = useQuery();
  const exti = query.get('exti');

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
  const rawChat = '';//localStorage.getItem(`aichat-history-${chatGroup}`);
  const chatHistory = rawChat ? JSON.parse(rawChat) : [{
    role: "assistant",
    content: "Upload a design mock to auto-generate code for a React component",
  }];

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
  const handleSwitchChat = async(page: number) => {
    setChatGroup(page);
    const rawChat = localStorage.getItem(`aichat-history-${page}`);
    if(rawChat) {
      setResponse([...JSON.parse(rawChat)]);
    } else {
      setResponse([{
        role: "assistant",
        content: "Upload a design mock to auto-generate code for a React component",
      }]);
    }

    document.title = `Mokzu – Mock ${page || '1'}`;
  }

  useEffect(() => {
    if (exti) {
      setImage(`/mokzu-api/uploads/${exti}`);
      handleSubmit('Here is my image');
    }
  }, [exti]);

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
    (async () => {
      if (componentCode === '') return;
      setIsGenerated(false);
      const response = await fetch(backendBase + '/mokzu-api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({code: componentCode}),
      });

      console.log('generated component on the backend');
      if (iframeRef.current) {
      console.log('>>>generated component on the backend');
        const random = '?a=' + (Math.random() % 10000).toString();
        // iframeRef.current.src = `${backendBase}/mokzu-api/sites/app1/${random}`;
        iframeRef.current.src = `${backendBase}/mokzu-app1/${random}`;
        setIsGenerated(true);

        console.log(iframeRef.current.src);
      }
    })();
  }, [componentCode]);

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
      const formData = new FormData();

      if (fileInputRef.current && fileInputRef.current.files) {
        formData.append('image', fileInputRef.current.files[0]);
      }
      if (exti) {
        formData.append('exti', exti);
      }
      formData.append('messages', JSON.stringify(messages));
      formData.append('model', selectedModel);
      formData.append('stream', 'true');

      const responseStream = await fetch(backendBase + '/mokzu-api/oa/chat/completions', {
        method: 'POST',
        body: formData,
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

          const parts = buffer.split(/\r?\n/);
          buffer = parts.pop() || '';
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
            const matches = tempContent.match(/```\w{0,15}\n(.*?)```/s)
            if (matches) {
              setComponentCode(matches[1]);
              console.log("Captured Group:", matches[1]);
            }
            setResponse(updatedResponse);
            localStorage.setItem(`aichat-history-${chatGroup}`, JSON.stringify(updatedResponse));
          }
        }
      }
      window.gtag('event', 'app_response', {
        event_category: 'App Interaction',
        event_label: 'Response Generated',
      });
    } catch (error: any) {}
    setFinishedResponding(true);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const handleKeyDownApp = (e: any) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setShowPrompts(true);
    }
    if(e.key === 'Escape') {
      setShowPrompts(false);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownApp);
    return () => {
      window.removeEventListener('keydown', handleKeyDownApp);
    };
  }, []);

  const [image, setImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setComponentCode('')
      handleSubmit('Here is my image');
    }
  };

  const handleAddImage = () => {
    const listNum = listGroup.length + 1;
    setListGroup([...listGroup.sort((a,b) => b-a), listNum])
    localStorage.setItem('listgroup', JSON.stringify([...listGroup.sort((a,b) => b-a), listGroup.length + 1]));
    handleSwitchChat(listNum);
    setMobileMenuActive(false);
    fileInputRef.current?.click();
  }

  useEffect(() => {
    if (chatHistoryRef.current) {
      setTimeout(() => {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }, 300);
    }
  }, [response]);
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
    setShowPrompts(false);
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

  useEffect(() => {
    checkOverflow();
  }, [response]);

  function createAsciiBox(text) {
     const paddingSize = 2; // Define the padding size
     const lines = text.split('\n');
     const longestLine = Math.max(...lines.map(line => line.length));
     const totalPadding = ' '.repeat(paddingSize);
     const horizontalBorder = '+-' + '-'.repeat(longestLine + paddingSize * 2) + '-+';

     const boxedLines = lines.map(line => {
          const padding = ' '.repeat(longestLine - line.length);
          return `| ${totalPadding}${line}${padding}${totalPadding} |`;
     });

     return ['/*', horizontalBorder, ...boxedLines, horizontalBorder, '*/', ''].join('\n');
  }

  function errorProof(content) {
    return content.replace(
      /import\s+(\{?\s*([A-Za-z0-9_\s,]+)\s*\}?)\s+from\s+['"]([^'"]+)['"];?/g,
      (match, fullImports, imports, moduleName) => {
         const importList = imports.split(',').map(name => name.trim());
         const isNamedImport = fullImports.startsWith('{');
         const replacements = importList.map(name => {
            const requireStatement = isNamedImport
              ? `require('${moduleName}').${name}`
              : `require('${moduleName}')`;
            return `
    let ${name} = () => {};
    try {
      ${name} = ${requireStatement};
    } catch (e) {};`;
         });
         return replacements.join('\n');
      }
    );
  }

  const handleCopy = (code) => {
    copyBtnRef.current.innerHTML = '✅';
    const install_comment = `
Generated by https://mokzu.com

1. Install dependencies:

npm i tailwindcss @remixicon/react daisyui

2. Add to your index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

`;

    const asciiBox = createAsciiBox(install_comment);
    navigator.clipboard.writeText(asciiBox + errorProof(code))
      .then(() => {
        setTimeout(() => {
          copyBtnRef.current.innerHTML = '📋';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const componentsData = [
    { component: 'ComponentA', linesOfCode: 123 },
    { component: 'ComponentB', linesOfCode: 456 },
    { component: 'ComponentC', linesOfCode: 789 },
  ];

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
        <div className="logo-header">
          <a href="/" className="logo-icon"><img src={GenericLogo} /></a>
          <a href="/" style={{ verticalAlign: 'super', color: 'white' }}>Mokzu</a>
        </div>
      </span>
      <div className={`chat-sidebar mobile-menu ${mobileMenuActive ? 'menu-active' : ''}`}>
        <span className="close-icon" onClick={() => setMobileMenuActive(false)}>+</span>
        <div className="chat-header">
          <a href="/" className="logo-icon"><img src={GenericLogo} /></a>
          <a href="/">Mokzu</a>
        </div>
        <div className="list-item-wrap">
          {false && listGroup && listGroup.length > 0 && listGroup.map((val: any, index: number) => (
          <div key={`menu-${val}-index-${index}`} className={`list-item${chatGroup === val ? ' active' : ''}`}
            onClick={() => { setMobileMenuActive(false); handleSwitchChat(val) }}>
            <MenuItem page={val} />
          </div>))}

          {/*<div className="list-item"></div>*/}
          {/* <Graph width="280" height="300" /> */}

          <a className="ext-button" href="https://chromewebstore.google.com/detail/mokzu/bcmfikdjbbnmdpiajbckbkbnalbibkjc" target="_blank">
            <button>
               Get the Chrome Extension
            </button>
          </a>
          <div className="intro-text">
            <h2>Transform Mocks into Code</h2>
            <p>
              Mokzu turns design mocks into functional React components effortlessly. Simply capture any area on your screen and Mokzu converts it into code. Streamline your design-to-code process and boost productivity.
            </p>
          </div>
          {image.length > 0 && (
            <div className="image-card">
              <img src={image} alt="Selected" />
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="generate-button generate-button-sidebar" onClick={() => handleAddImage()}>
          <span>Add Image</span>
        </div>
      </div>
      <div className="chat-history" onClick={() => setMobileMenuActive(false)}>

        <div className="chat-history-content" ref={chatHistoryRef}>
          <TopIcon />
          {response.map((item: any, index: number) => (
            <div key={`chat-${index}`}>
              <ChatResponse item={item} index={index} />
              {index === 0 && (
                <div className="generate-button" onClick={() => handleAddImage()}>
                  <span>Add Image</span>
                </div>
              )}
              {index === 1 && image.length > 0 && (
                <div className="image-card">
                  <img src={image} alt="Selected" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
          )}
          <BottomIcon />
        </div>

          <PromptInput value={value}
            setValue={setValue}
            handleKeyDown={handleKeyDown}
            handleSubmit={handleSubmit} />

          <div className="comp">
            {componentCode.length > 0 ? (
              <>
                <iframe
                  style={{ display: isGenerated ? 'block' : 'none' }} ref={iframeRef}
                />
                {isGenerated ? (
                  <button
                    ref={copyBtnRef}
                    onClick={() => handleCopy(componentCode)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '5px',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                    aria-label="Copy to clipboard"
                  >
                    Copy React Code 📋
                  </button>
                ) : (
                  <LoadingSpinner />
                )}
              </>
            ) : (
              image.length > 0 ? (
                <div className="get-started">
                  &lt;&gt;generating code...&lt;/&gt;
                </div>
              ) : (
                <div className="get-started">
                  &lt;&gt;upload an image to get started&lt;/&gt;
                </div>
              )
            )}
          </div>
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
