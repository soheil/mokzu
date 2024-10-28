/* eslint-disable @typescript-eslint/no-explicit-any */
import "./Pricing.scss";

// components
import CTAButton from "./components/Home/CTAButton/CTAButton";
// import TrialButton from "./components/TrialButton/TrialButton";
import TestimonialCard from "./components/Home/TestimonialCard/TestimonialCard";
import DiscountBadge from "./components/Home/DiscountBadge/DiscountBadge";

// assets
import BrandLogo from "./assets/brandlogo.png";
// import AvatarGroup from "./assets/avatar-group.png";
import Logo from "./assets/generic-logo.png";


// Testimonial Card Images
import TestImage1 from "./assets/testimonials/test1.png";
import TestImage2 from "./assets/testimonials/test2.png";
import TestImage3 from "./assets/testimonials/test3.png";
import TestImage4 from "./assets/testimonials/test4.png";
import TestImage5 from "./assets/testimonials/test5.png";
import TestImage6 from "./assets/testimonials/test6.png";

function Pricing() {
  // useEffect(() => {
  //   const script = document.createElement('script');
  //   script.id = 'gorgias-chat-widget-install-v3';
  //   script.src = 'https://config.gorgias.chat/bundle-loader/01HZQSZ8BZAE7MAESPK0JP4EJ7';
  //   document.body.appendChild(script);

  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);
return (
    <div className="container home-container pricing-page">
      <div className="home-section">
        <a href="/" className="home-logo">
            <img src={Logo} />
            <p>mokzu</p>
        </a>
        {/* <h1>Amazing</h1>
        <h1 className="subheadline">AI Chat Experience</h1>
        <p className="tagline">The #1 chat frontend UI for ChatGPT, Gemini, Claude and more.</p>
        <div className="banner-actions">
            <CTAButton />
            <TrialButton />
        </div>
        <div className="past-users">
            <img src={AvatarGroup} className="avatar-group" />
            <p>Loved by 13,980+ paying customers</p>
        </div> */}
        <div className="pricing-stats-wrap">
            <div className="pricing-stat">
                <p>12k</p>
                <span>paying subscribers</span>
            </div>
            <div className="pricing-stat">
                <p>229k</p>
                <span>Active websites</span>
            </div>
            <div className="pricing-stat">
                <p>79B</p>
                <span>Tracked pageviews</span>
            </div>
        </div>
      </div>

      {/* Pricing Tiles */}
      <div className="pricing-tiles-wrap">
        <div className="pricing-tile">
            <p className="pricing-plan">Silver</p>
            <p className="pricing-price"><span>$28</span> / month</p>
            <CTAButton title="Start your free trial" altIcon={true} />
            <ul>
                <li>Up to 3 team members</li>
                <li>Up to 10 sites</li>
                <li>3 years of data retention</li>
                <li>Intuitive, fast & privacy friendly dashboard</li>
                <li>Remove all ads</li>
                <li>All chat features</li>
                <li>All Characters/models</li>
            </ul>
        </div>
        <div className="pricing-tile grow-tile">
            <p className="pricing-plan">Gold <span className='discount-badge'><DiscountBadge /> 10% off</span></p>
            <p className="pricing-price"><span>$37</span> / month</p>
            <CTAButton gradientButton={true} title="Start your free trial" altIcon={true} />
            <ul>
                <li>Everything in Silver</li>
                <li>up to 3 team members</li>
                <li>up to 10 team members</li>
                <li>up to 10 team members</li>
                <li>up to 10 team members</li>
                <li>up to 10 team members</li>
            </ul>
        </div>
        <div className="pricing-tile">
            <p className="pricing-plan">Growth</p>
            <p className="pricing-price"><span>$148</span> / month</p>
            <CTAButton title="Start your free trial" altIcon={true} />
            <ul>
                <li>Everything in Gold</li>
                <li>10+ team members</li>
                <li>10+ team members</li>
                <li>10+ team members</li>
            </ul>
        </div>
      </div>

      {/* Testimonial section */}

      <div className="home-section section-spacing" style={{ marginBottom: '16px' }}>
        <h1 className="subheadline"><span className="highlighted-text">People love</span> mokzu</h1>
      </div>

      <div className="content-cards-wrap">
        <div className="testimonial-column">
            <TestimonialCard
                title="My go-to ChatGPT client."
                content="I have entirely switched to mokzu from the normal ChatGPT client.<br/>
                I find the responses are typically faster than ChatGPT, which is probably due to the fact that you connect your own API key.<br/>
                You can put chats in folders, search them, switch between all sorts of models... it's awesome."
                imageUrl={TestImage1}
                customerName="Alex T."
                customerHandle="socialhandle"
                rating={5}
            />
            <TestimonialCard
                title="mokzu - best way to access LLM models with all the functionality of GPT Teams"
                content="It is such a superior alternative to GPT Teams with full privacy and extended capabilities. I highly recommend to everyone!"
                imageUrl={TestImage4}
                customerName="Taylor B."
                customerHandle="socialhandle"
                rating={5}
            />
        </div>
        <div className="testimonial-column">
            <TestimonialCard
                title="Excellent product"
                content="Continuously updated, with search, folders, prompts, and AI agents to make using GPT-4 much easier."
                imageUrl={TestImage2}
                customerName="Jordan M."
                customerHandle="socialhandle"
                rating={5}
            />
            <TestimonialCard
                title="So much better than the regular ChatGPT UI!"
                content="mokzu is a fantastic product, and I use it almost every day!
                Some of my favourite features:
                <ul><li>organize all my chats in different folders</li>
                <li>choose from different AI agents and presets (coder, marketer, technical writer, etc.)</li>
                <li>share chats with secret links (super useful as I have a lot of students asking questions)</li></ul>"
                imageUrl={TestImage5}
                customerName="Casey S."
                customerHandle="socialhandle"
                rating={5}
            />
        </div>
        <div className="testimonial-column">
            <TestimonialCard
                title="I just want to say this is an amazing tool!"
                content="It's an incredibly useful and practical front-end to GPT. I very much appreciate, also, that it's a one-time purchase.
                That made it a no-brainer."
                imageUrl={TestImage3}
                customerName="Sam W."
                customerHandle="socialhandle"
                rating={5}
            />
            <TestimonialCard
                title="mokzu is the future"
                content="I am the early adopter of the app and I use it every day way more often than I use ChatGPT.
                mokzu is the first app on my bookmark bar for a reason - it's just that great!"
                imageUrl={TestImage6}
                customerName="Morgan R."
                customerHandle="socialhandle"
                rating={5}
            />
        </div>
      </div>

        <div className="footer">
            <div className="branding">
                <p className="+">Best UI for AI chats</p>
                <img src={BrandLogo} className="brand-logo" />
                <div className="social-group">
                    <a href="https://x.com/mokzuai" target="_blank">@mokzuAI</a>
                    <a href="https://x.com/mokzuai" target="_blank">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_886_4796)">
                            <path d="M10.9998 21.0837C16.5687 21.0837 21.0832 16.5692 21.0832 11.0003C21.0832 5.43145 16.5687 0.916992 10.9998 0.916992C5.43097 0.916992 0.916504 5.43145 0.916504 11.0003C0.916504 16.5692 5.43097 21.0837 10.9998 21.0837Z" fill="#8C8A94"/>
                            <path d="M4.78038 5.14844L9.60009 11.5927L4.75 16.8323H5.84165L10.088 12.2449L13.5188 16.8323H17.2334L12.1424 10.0255L16.6569 5.14844H15.5653L11.6548 9.3732L8.49503 5.14844H4.78038ZM6.38569 5.95246H8.09219L15.6279 16.0282H13.9214L6.38569 5.95246Z" fill="white"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_886_4796">
                            <rect width="22" height="22" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>
                    </a>

                    {/*<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.57575C0 0.705375 0.72325 0 1.61562 0H20.3844C21.2768 0 22 0.705375 22 1.57575V20.4242C22 21.2946 21.2768 22 20.3844 22H1.61562C0.72325 22 0 21.2946 0 20.4242V1.57575ZM6.79662 18.4167V8.48238H3.49525V18.4167H6.79662ZM5.14663 7.12525C6.2975 7.12525 7.01388 6.3635 7.01388 5.40925C6.99325 4.43437 6.29888 3.69325 5.16862 3.69325C4.03837 3.69325 3.3 4.43575 3.3 5.40925C3.3 6.3635 4.01638 7.12525 5.12463 7.12525H5.14663ZM11.8951 18.4167V12.8686C11.8951 12.5716 11.9171 12.2746 12.0051 12.0629C12.243 11.4703 12.7861 10.8556 13.6991 10.8556C14.894 10.8556 15.3711 11.7659 15.3711 13.1024V18.4167H18.6725V12.7188C18.6725 9.66625 17.0445 8.24725 14.872 8.24725C13.1202 8.24725 12.3351 9.20975 11.8951 9.88762V9.922H11.8731L11.8951 9.88762V8.48238H8.59513C8.63637 9.41463 8.59513 18.4167 8.59513 18.4167H11.8951Z" fill="#8C8A94"/>
                    </svg>*/}
                </div>
            </div>
            <div className="link-section">
                <div className="link-group">
                    <p>Products</p>
                    {/*<a>mokzu AI</a>*/}
                    <a href="/app">mokzu AI for Teams</a>
                </div>
                {/*<div className="link-group">
                    <p>Resources</p>
                    <a>Changelog</a>
                    <a>Blog</a>
                </div>*/}
                <div className="link-group">
                    <p>Company</p>
                    <a href="/pricing" target="_blank">Pricing</a>
                    <a href="javascript:void(0);" onClick={() => document.location='mailto:' + 'h' + 'i@' + 'fo' + 'xaci' + 'd.ai?subject=Contact+mokzu+Homepage'}>Contact</a>
                </div>
                <div className="link-group">
                    <p>Docs</p>
                    <a href="https://help.mokzu.com" target="_blank">Guides & Tutorials</a>
                </div>
            </div>
        </div>
        
        <div className="sub-footer">
            <a href="/privacy/">Privacy Policy</a>
            <a href="/terms/">Terms & Conditions</a>
        </div>
    </div>
  );
}

export default Pricing;
