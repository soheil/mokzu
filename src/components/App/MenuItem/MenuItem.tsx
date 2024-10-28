/* eslint-disable @typescript-eslint/no-explicit-any */
// App.tsx
import React, { useEffect, useState } from "react";
import "./MenuItem.scss";
type AppProps = {
    page: number
  };
function MenuItem({ page }: AppProps) {
    // Localstorage
    const rawChatHistory: any = localStorage.getItem(`aichat-history-${page}`);
    const [formattedDate, setFormattedDate] = useState('');

    const parsedHistory = JSON.parse(rawChatHistory);

    useEffect(() => {
        if (parsedHistory && parsedHistory.length > 0) {
          const lastDate = parsedHistory[parsedHistory.length - 1].date;
          const dateObj = new Date(lastDate);
    
          const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            let hours = dateObj.getHours();
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';

            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strHours = String(hours).padStart(2, '0');
    
          setFormattedDate(`${month}/${day} - ${strHours}:${minutes} ${ampm}`);
        }
      }, [parsedHistory]);

    if(!parsedHistory) {
        localStorage.removeItem(`aichat-history-${page}`);
        const listGroup = localStorage.getItem(`listgroup`);
        if(!listGroup || listGroup.length === 0) return;
        const filteredListGroup = JSON.parse(listGroup).filter((list: number) => {
            if(!parsedHistory && list === page) {
                return false;
            }
            return true;
        })
        localStorage.setItem('listgroup', JSON.stringify([...filteredListGroup]));
        // return;
    }

    return (
        <React.Fragment>
            <span className="list-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.8123 11.0213C19.0446 11.1911 16.4345 12.3672 14.4737 14.328C12.5129 16.2887 11.3369 18.8988 11.167 21.6666H11.1243C10.9548 18.8987 9.77877 16.2885 7.81794 14.3276C5.85711 12.3668 3.24685 11.1908 0.479004 11.0213L0.479004 10.9786C3.24685 10.809 5.85711 9.63302 7.81794 7.67219C9.77877 5.71136 10.9548 3.10109 11.1243 0.333252L11.167 0.333252C11.3369 3.101 12.5129 5.7111 14.4737 7.67187C16.4345 9.63265 19.0446 10.8087 21.8123 10.9786V11.0213Z" fill="url(#paint0_radial_1160_4979)"/>
                <defs>
                <radialGradient id="paint0_radial_1160_4979" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.59634 9.00392) rotate(18.6832) scale(22.7067 181.895)">
                <stop offset="0.067" stopColor="#9168C0"/>
                <stop offset="0.343" stopColor="#5684D1"/>
                <stop offset="0.672" stopColor="#1BA1E3"/>
                </radialGradient>
                </defs>
            </svg>

            </span>
            <div className="list-details">
                <p className="list-date">{ formattedDate || `Chat Thread ${page || 1}` }</p>
                <span className="list-content">{ parsedHistory && parsedHistory[parsedHistory.length - 1].content || "General Chat Bot" }</span>
            </div>
        </React.Fragment>
    );
    }

export default MenuItem;
