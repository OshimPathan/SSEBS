import React from 'react';
import { MapPin, Phone, Mail, Send, MessageCircle, Clock } from 'lucide-react';

const Contact = () => {
    return (
        <section id="contact" className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="section-title">Get In Touch</h2>
                    <div className="section-divider" />
                    <p className="section-subtitle">Have questions about admissions or programs? We're here to help.</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-primary text-white p-6 rounded-lg">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1 font-serif">Address</h4>
                                    <p className="text-white/80 text-sm">Rohini River Bridge, Dhekawar<br />Devdaha Municipality-2, Rupandehi<br />Lumbini Province, Nepal</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <div className="flex items-start gap-4">
                                <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1 font-serif text-gray-900">Phone</h4>
                                    <p className="text-gray-600 text-sm">9857078448 / 9851206206<br />9866390245 / 9807400046<br />071-680529</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <div className="flex items-start gap-4">
                                <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1 font-serif text-gray-900">Email</h4>
                                    <p className="text-gray-600 text-sm">sevenstar.school2063@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <div className="flex items-start gap-4">
                                <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1 font-serif text-gray-900">Office Hours</h4>
                                    <p className="text-gray-600 text-sm">Sun – Fri: 9:00 AM – 5:00 PM<br />Saturday: Closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="rounded-lg overflow-hidden h-48 shadow-sm">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d28287.541867332868!2d83.56218300000002!3d27.595305000000003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39969d3290c84dc9%3A0x58256433dc50c82d!2sSeven%20Star%20English%20Boarding%20School!5e0!3m2!1sen!2sus!4v1742107873246!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Maps"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3 bg-gray-50 rounded-lg p-8 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">Send us a Message</h3>
                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="firstName" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">First Name</label>
                                    <input type="text" id="firstName" className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm" placeholder="John" />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Last Name</label>
                                    <input type="text" id="lastName" className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
                                <input type="email" id="email" className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Phone</label>
                                <input type="tel" id="phone" className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm" placeholder="+977 98XXXXXXXX" />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Inquiry Type</label>
                                <select id="subject" className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm">
                                    <option>Admission Inquiry</option>
                                    <option>Fee Structure</option>
                                    <option>General Question</option>
                                    <option>Careers</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Message</label>
                                <textarea id="message" rows="4" className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow text-sm resize-none" placeholder="How can we help you?"></textarea>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button type="submit" className="flex-1 btn-primary py-3 text-base flex justify-center items-center gap-2">
                                    Send Message <Send className="w-4 h-4" />
                                </button>
                                <a href="https://wa.me/9779857078448?text=Namaste%21" target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-base flex justify-center items-center gap-2 rounded font-semibold transition-colors uppercase tracking-wide text-sm">
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
