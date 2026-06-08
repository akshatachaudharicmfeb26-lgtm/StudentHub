import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-text">
        <p>&copy; {new Date().getFullYear()} StudentHub Platform. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#6b7280' }}>
          Designed for faculty admins and student course management.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
