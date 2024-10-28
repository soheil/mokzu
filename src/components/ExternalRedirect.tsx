import { useEffect } from 'react';

const ExternalRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.href = to;
  }, [to]);

  return null;
};

export default ExternalRedirect;
