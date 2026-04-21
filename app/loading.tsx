"use client";

import React from 'react';

export default function RootLoading() {
  return (
    <div className="root-loading-container">
      <div className="loader-glitter">
        <div className="loader-content">
          <div className="loader-logo">
            BB<span>FRANCE</span>
          </div>
          <div className="loader-bar">
            <div className="loader-progress"></div>
          </div>
          <p>Chargement du terrain...</p>
        </div>
      </div>

      <style jsx>{`
        .root-loading-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          z-index: 9999;
        }

        .loader-glitter {
          padding: 2rem;
          border-radius: 20px;
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
          min-width: 300px;
        }

        .loader-logo {
          font-family: var(--font-saison3);
          font-size: 2rem;
          font-weight: 900;
          font-style: italic;
          letter-spacing: -1px;
          margin-bottom: 1.5rem;
          color: var(--foreground);
        }

        .loader-logo span {
          color: var(--primary);
        }

        .loader-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .loader-progress {
          width: 40%;
          height: 100%;
          background: var(--primary);
          border-radius: 2px;
          animation: loading-bar 1.5s infinite ease-in-out;
        }

        p {
          font-family: var(--font-saison3);
          font-size: 0.9rem;
          color: var(--foreground-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
