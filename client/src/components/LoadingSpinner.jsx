import React from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500"></div>
    </div>
);

export default LoadingSpinner;
