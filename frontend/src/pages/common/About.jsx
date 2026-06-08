import React from 'react';

const About = () => {
  return (
    <div className="about-container animate-fade">
      <div className="about-header">
        <h1>About StudentHub</h1>
        <p className="about-subtitle">
          A modern student and course administration portal engineered for academic institutions.
        </p>
      </div>

      <div className="about-content">
        <h2>Our Core Vision</h2>
        <div className="about-body">
          <p>
            StudentHub aims to bridge the gap between students and faculty members. By providing a clean and intuitive interface, we make registration, course exploration, enrollment tracking, and student account administration fast and secure.
          </p>
          <p>
            Our platform empowers educational institutions to streamline their academic workflows, allowing students to discover courses, manage their academic progress, and connect with faculty members seamlessly. Administrators can efficiently manage courses, track student enrollments, and maintain institutional operations with ease.
          </p>
          <p>
            Whether you're a student looking to expand your academic horizons or an institution seeking to modernize your administrative processes, StudentHub provides a unified workspace designed with your success in mind.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
