/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from 'react-markdown';
import "./ChatResponse.scss";

type AppProps = {
    item?: any;
    index?: number
};

const parseContent = (content: string, parentIndex: any) => {
    // Split the response into parts, keeping the delimiters
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Check if the part is a code block
      const codeBlockMatch = part.match(/```([\s\S]*?)```/);

      if (codeBlockMatch) {
        const [firstLine, ...rest] = codeBlockMatch[1].split(' ');
        const language = firstLine.split('\n')[0];
        return (<div key={`c-${index}`}>
        <p>{language}</p>
        <SyntaxHighlighter
            language={language}
            style={dark}
            customStyle={{ padding: '10px', borderRadius: '5px', background: '#1b1b1b' }}
          >
            {rest.join(' ')}
          </SyntaxHighlighter>
        </div>
        );
      } else {
        // Regular text
        return (
          <ReactMarkdown
            key={`markdown-${parentIndex}-${index}`}
            children={part}
            components={{
              code(props) {
                const {children, className, ...rest} = props;
                return (
                  <code {...rest} className={className}>
                    {children}
                  </code>
                )
              },
              a(props) {
                const {href, children, ...rest} = props;
                return (
                  <a href={href} target="_blank" {...rest}>
                    {children}
                  </a>
                );
              }
            }}
          />
        );
      }
    });
  };

function ChatResponse({ item, index }: AppProps) {
    return (
        <div className="response-item chat-response">
            {item.role === 'assistant' ? (
            <span className="chatbot-icon">AI</span>
            ) : (
            <span className="chatbot-icon user-chaticon">ME</span>
            )}
            <span className="response-content">
            {/*{item && item.content && item.content.match(/\bhttps?:\/\/\S+\.(?:jpe?g|png|gif)\b/i) ? (
                <img src={item.content} alt="" />
            ) : }*/
            (
                parseContent(item.content, index)
                // item.content
            )}
            </span>
    </div>
    );
}

export default ChatResponse;
