import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import './global-spinner.css';

export default function GlobalSpinner() {
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show spinner on every route change
        setIsVisible(true);

        // Hide after a short delay (simulating load time)
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 600); // 600ms feels snappy but visible

        return () => clearTimeout(timer);
    }, [location.pathname]);

    if (!isVisible) return null;

    return (
        <div className="global-spinner-overlay">
            <div className="spinner-content">
                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                <p>Refreshing...</p>
            </div>
        </div>
    );
}
