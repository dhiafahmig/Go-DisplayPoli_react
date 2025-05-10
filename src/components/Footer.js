import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopyright } from '@fortawesome/free-regular-svg-icons';

const Footer = ({ copyright = "Rumah Sakit Bumi Waras", author = "" }) => {
  return (
    <footer className="bg-white py-6 text-center text-gray-600 shadow-md border-t border-gray-100">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCopyright} className="mr-2" />
          <p>2025 {copyright}</p>
        </div>
        {author && <p className="text-xs text-gray-400 mt-1">{author}</p>}
      </div>
    </footer>
  );
};

export default Footer; 