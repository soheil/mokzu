/* eslint-disable @typescript-eslint/no-explicit-any */
import "./FeatureCard.scss";
type AppProps = {
    title: string;
    content: string;
    imageUrl: string;
  };

function FeatureCard({ title, content, imageUrl }: AppProps) {
return (
    <div className="feature-card">
      <img src={imageUrl} />
      <p className="content-title">{title}</p>
      <p className="content-contents">{content}</p>
    </div>
  );
}

export default FeatureCard;
