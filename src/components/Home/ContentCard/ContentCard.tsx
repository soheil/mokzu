/* eslint-disable @typescript-eslint/no-explicit-any */
import "./ContentCard.scss";
type AppProps = {
    title: string;
    content: string;
    imageUrl: string;
    iconUrl?: string;
    locksize?: boolean;
  };

function ContentCard({ title, content, imageUrl, iconUrl = "", locksize = false }: AppProps) {
return (
    <div className="content-card">
      <p className="content-title">
          { iconUrl && iconUrl !== "" ? <div className="content-icon"><img src={iconUrl} /></div> : null }
          {title}
      </p>
      <p className="content-contents">{content}</p>
      <img src={imageUrl} className={`${locksize ? 'locksize': null}`} />
    </div>
  );
}

export default ContentCard;
