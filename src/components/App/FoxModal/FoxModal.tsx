/* eslint-disable @typescript-eslint/no-explicit-any */
// App.tsx
import React, { ReactNode } from "react";
import "./FoxModal.scss";

type AppProps = {
    show: boolean,
    children: ReactNode
  };

function FoxModal({ show = false, children }: AppProps) {

return (
    <React.Fragment>
        { show ? <div className="fox-modal">
            <div className="fox-modal-content">
                {children}
            </div>
        </div> : null }
    </React.Fragment>
  );
}

export default FoxModal;
