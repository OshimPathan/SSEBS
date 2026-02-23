import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

const ScrollReveal = ({ children, className = '', delay = 0, direction = 'up' }) => {
    const [ref, visible] = useScrollReveal(0.1);

    const directionStyles = {
        up: 'translate-y-8',
        down: '-translate-y-8',
        left: 'translate-x-8',
        right: '-translate-x-8',
        none: '',
    };

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                visible
                    ? 'opacity-100 translate-y-0 translate-x-0'
                    : `opacity-0 ${directionStyles[direction] || directionStyles.up}`
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
