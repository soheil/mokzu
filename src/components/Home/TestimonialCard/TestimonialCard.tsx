/* eslint-disable @typescript-eslint/no-explicit-any */
import "./TestimonialCard.scss";
type AppProps = {
    title: string;
    content: string;
    imageUrl: string;
    customerName: string;
    customerHandle: string;
    rating: number;
  };

function TestimonialCard({ title, content, imageUrl, customerName, rating }: AppProps) {
return (
    <div className="testimonial-card">
      <div className="user-row">
        <img src={imageUrl} />
        <div className="user-details">
            <p className="customer-name">{ customerName }</p>
            {/* <p className="customer-handle">@{ customerHandle }</p> */}
        </div>
      </div>
      <div className="ratings">
      {[...Array(rating)].map((_item: any, index: number) => (
        <svg key={`fav-${index}`} width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.4915 19L6.1165 11.975L0.666504 7.25L7.8665 6.625L10.6665 0L13.4665 6.625L20.6665 7.25L15.2165 11.975L16.8415 19L10.6665 15.275L4.4915 19Z" fill="#FCBF04"/>
        </svg>
      ))}
      </div>
      <p className="content-title">{title}</p>
      <p className="content-contents" dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
}

export default TestimonialCard;
