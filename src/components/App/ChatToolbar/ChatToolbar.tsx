/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import "./ChatToolbar.scss";

type AppProps = {
    setModel: any;
    openai: any;
  };

function ChatHeader({ setModel, openai }: AppProps) {

  const [models, setModels] = useState([]);

  if(models.length === 0) {
    openai.models.list().then((response: any) => {
      const { data } = response;
      setModels(data);
    })
  }

  return (
      <div className="chat-toolbar">
          <div>
            <select onChange={setModel} className="fox-select">
              <option value="gpt-4o">GPT-4o Model</option>
              <option value="gpt-4-turbo">GPT-4 Turbo Model</option>
              <option value="gpt-3.5-turbo-0125">GPT-3.5 Turbo Model</option>
              { models.filter((model: any) => model.id.includes('gpt')).map((model: any) => {
                return (<option key={`model-${model.id}`} value={model.id}>{model.id}</option>);
              }) }
            </select>
          </div>
          <div>
            <a className="generate-button" href="https://buy.stripe.com/eVaaFsakx9k0gZG4gg" target="_blank">Upgrade</a>
          </div>
      </div>
    );
  }

export default ChatHeader;