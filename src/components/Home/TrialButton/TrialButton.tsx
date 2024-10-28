/* eslint-disable @typescript-eslint/no-explicit-any */
import "./TrialButton.scss";

type AppProps = {
  content?: string;
};

function TrialButton({content}: AppProps) {
return (
    <a href="/app">
      <div className="trial-button">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.25 11.25H4.5L9.75 0.75V6.75H13.5L8.25 17.25V11.25Z" fill="#FCBF04"/>
        </svg>
        <span>{content ? content : "Free Trial"}</span>
      </div>
    </a>
  );
}

export default TrialButton;
