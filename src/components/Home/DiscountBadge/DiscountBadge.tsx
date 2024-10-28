// App.tsx
import "./DiscountBadge.scss";
import Badge from './badge.png';

function DiscountBadge() {
    return (
        <div className="badgeWrap">
            <img src={Badge} className="badgeIcon" />
        </div>
    );
}

export default DiscountBadge;
