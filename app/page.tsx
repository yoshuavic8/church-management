'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDownIcon, UserGroupIcon, HeartIcon, BookOpenIcon, CalendarIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✚</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Church Management
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('community')} className="text-gray-700 hover:text-blue-600 transition-colors">
                Community
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </button>
              
              {/* Login Button with Settings/Key Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowLoginOptions(!showLoginOptions)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg border border-gray-200 hover:border-blue-300"
                  aria-label="Login Options"
                  title="Access Login Portal"
                >
                  {/* Settings Gear Icon for Login */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {showLoginOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <Link
                      href="/auth/member/login"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      <span>Member Login</span>
                    </Link>
                    <Link
                      href="/auth/admin/login"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      <span>Admin Portal</span>
                    </Link>
                    <hr className="my-2" />
                    <Link
                      href="/self-checkin"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Self Check-in</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowLoginOptions(!showLoginOptions)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to Our
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Church Community
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A place where faith meets fellowship, where hearts are transformed, 
              and where every person is valued and loved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => scrollToSection('about')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Learn More About Us
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Our Services
              </button>
            </div>
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDownIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About Our Church
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are a vibrant community of believers dedicated to worship, fellowship, 
              and serving our community with love and compassion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Love & Compassion</h3>
              <p className="text-gray-600">
                We believe in showing God's love through our actions and serving those in need 
                with compassion and kindness.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Biblical Teaching</h3>
              <p className="text-gray-600">
                Our foundation is built on the truth of God's Word, providing practical teachings 
                for daily life and spiritual growth.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We foster authentic relationships and create opportunities for fellowship, 
                growth, and mutual support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join us for worship, fellowship, and spiritual growth throughout the week.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <CalendarIcon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sunday Worship</h3>
              <p className="text-gray-600 mb-3">Join us every Sunday at 9:00 AM for inspiring worship and fellowship.</p>
              <p className="text-sm text-gray-500">Sundays • 9:00 AM</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <UserGroupIcon className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cell Groups</h3>
              <p className="text-gray-600 mb-3">Small group gatherings for deeper fellowship and Bible study.</p>
              <p className="text-sm text-gray-500">Various times • Throughout the week</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <BookOpenIcon className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bible Study</h3>
              <p className="text-gray-600 mb-3">Weekly Bible study sessions for spiritual growth and learning.</p>
              <p className="text-sm text-gray-500">Wednesdays • 7:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Community
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe in building strong relationships and supporting one another 
              in our faith journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Join Our Growing Family
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Cell Groups</h4>
                    <p className="text-gray-600">Connect with others in small group settings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Ministry Teams</h4>
                    <p className="text-gray-600">Use your gifts to serve and make a difference</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Community Projects</h4>
                    <p className="text-gray-600">Together we serve our local community</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Get Connected
              </h3>
              <p className="text-gray-600 mb-6">
                Whether you're new to faith or have been walking with God for years, 
                there's a place for you in our community.
              </p>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              We'd love to hear from you. Reach out to us with any questions 
              or to learn more about our community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <MapPinIcon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">
                123 Church Street<br />
                Your City, State 12345
              </p>
            </div>
            
            <div>
              <PhoneIcon className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">
                (555) 123-4567<br />
                Available Mon-Fri, 9AM-5PM
              </p>
            </div>
            
            <div>
              <EnvelopeIcon className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">
                info@ourchurch.com<br />
                We'll get back to you soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">✚</span>
            </div>
            <span className="text-lg font-semibold">Church Management</span>
          </div>
          <p className="text-sm">
            © 2025 Church Management. All rights reserved. Built with love for our community.
          </p>
        </div>
      </footer>
      
      {/* Mobile Login Menu */}
      {showLoginOptions && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg">
            <div className="px-4 py-2">
              <Link
                href="/auth/member/login"
                className="block py-3 text-gray-700 hover:text-blue-600 border-b border-gray-100"
              >
                Member Login
              </Link>
              <Link
                href="/auth/admin/login"
                className="block py-3 text-gray-700 hover:text-blue-600 border-b border-gray-100"
              >
                Admin Portal
              </Link>
              <Link
                href="/self-checkin"
                className="block py-3 text-gray-700 hover:text-blue-600"
              >
                Self Check-in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
