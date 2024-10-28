/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { PromptData } from "./PromptData";
import "./PromptLibrary.scss";

type AppProps = {
    prefillPrompt?: (prompt: string) => void; // Use a more specific type for prefillPrompt
    setSystemMessage?: (prompt: string) => void; // Use a more specific type for prefillPrompt
};

function PromptLibrary({ setSystemMessage }: AppProps) {
    const [selectedPromptContent, setSelectedPromptContent] = useState<string>("");
    const [showTextarea, setShowTextarea] = useState<boolean>(false);

    const prompts: any = PromptData;

    const handlePrefillPrompt = (prompt: string) => {
        setSelectedPromptContent(prompt);
        setShowTextarea(true);
    };

    const handleBack = () => {
        setShowTextarea(false);
        setSelectedPromptContent("");
    };

    const handleSave = () => {
        if (setSystemMessage) {
            // prefillPrompt(selectedPromptContent);
            setSystemMessage(selectedPromptContent);
        }
        setShowTextarea(false);
        setSelectedPromptContent("");
    };

    return (
        <div className="prompt-library">
            {!showTextarea ? (
                <>
                    <div className="prompt-header">
                        <h2>Prompt Library</h2>
                        <p>Prompts are message templates that you can quickly fill in the chat input. Some prompts come with variables.</p>
                    </div>
                    <div className="prompt-items">
                        {prompts.map((prompt: any, index: number) => (
                            <div className="prompt-item" key={`prompt-${index}`}>
                                <div className="prompt-left">
                                    <p>{prompt.name}</p>
                                    <p>{prompt.description}</p>
                                </div>
                                <div className="prompt-right">
                                    <button className="save-btn" onClick={() => handlePrefillPrompt(prompt.content)}>
                                        + Select
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="prompt-items textarea-container">
                    <div className="prompt-header">
                        <h2>System Message</h2>
                        <p>Set your prompt in system message to tune your chatbot.</p>
                    </div>
                    <div className="prompt-system-message">
                        <textarea value={selectedPromptContent || ''} onChange={(e) => setSelectedPromptContent(e.target.value)} />
                    </div>
                    <div className='prompt-actions'>
                        <button className="secondary-btn" onClick={handleBack}>
                            Back
                        </button>
                        <button className="save-btn" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            )}
            <div className="library-footer">
                <p className="keyboard-tip">
                    <span className="operator">esc</span> to close
                </p>
            </div>
        </div>
    );
}

export default PromptLibrary;