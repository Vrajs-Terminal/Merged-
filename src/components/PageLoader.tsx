import React from 'react';
import './PageLoader.css';

interface PageLoaderProps {
    message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message = "Synchronizing Environment..." }) => {
    return (
        <div className="premium-loader-container animate-fade-in">
            <div className="loader-backdrop"></div>
            <div className="loader-content">
                <div className="loader-orb-wrapper">
                    <div className="loader-orb"></div>
                    <div className="loader-orb-pulse"></div>
                    <div className="loader-logo-inner">
                         <div className="loader-svg-wrapper">
                            <svg width="40" height="40" viewBox="0 0 50 50">
                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                            </svg>
                         </div>
                    </div>
                </div>
                
                <div className="loader-text-section">
                    <h3 className="loader-title">{message}</h3>
                    <div className="loader-progress-track">
                        <div className="loader-progress-fill"></div>
                    </div>
                    <p className="loader-status">Preparing high-performance interface</p>
                </div>
                
                <div className="loader-ambient-glow"></div>
            </div>
        </div>
    );
};

export default PageLoader;
