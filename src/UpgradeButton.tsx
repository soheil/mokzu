// @ts-nocheck
/*
+------------------------------------------------+
|                                                |
|   Generated by https://mokzu.com               |
|                                                |
|   1. Install dependencies:                     |
|                                                |
|   npm i tailwindcss @remixicon/react daisyui   |
|                                                |
|   2. Add to your index.css:                    |
|                                                |
|   @tailwind base;                              |
|   @tailwind components;                        |
|   @tailwind utilities;                         |
|                                                |
|                                                |
+------------------------------------------------+
*/
import React from 'react';

const stripeLink = 'https://buy.stripe.com/9AQ4h478lgMs6l2bIK';
const UpgradeButton = () => {
  return (
    <a className="upgrade-button generate-button glass-button mb-2" href={stripeLink} target="_blank">
      <span>Upgrade to Premium
        <svg
          width="32"
          height="18"
          viewBox="0 0 64 52"
          xmlns="http://www.w3.org/2000/svg"
          fill="gold"
        >
          <path d="M2 40L10 18 20 32 32 12 44 32 54 18 62 40H2z" />
          <rect x="2" y="40" width="60" height="10" rx="2" />
        </svg>
      </span>
    </a>
  );
};

export default UpgradeButton;
