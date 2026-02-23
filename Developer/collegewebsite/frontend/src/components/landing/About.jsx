import React from 'react';
import { Target, Flag, GraduationCap } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <h2 className="section-title">About Our Institution</h2>
                    <div className="section-divider" />
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* Image Side */}
                    <div className="relative">
                        <div className="rounded-lg overflow-hidden shadow-xl">
                            <img src="/banner.jpg" alt="Seven Star Campus" className="w-full h-80 md:h-96 object-cover" />
                        </div>
                        {/* Accent badge */}
                        <div className="absolute -bottom-6 -right-4 md:right-8 bg-primary text-white px-6 py-4 rounded shadow-lg">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-8 h-8 text-accent" />
                                <div>
                                    <div className="text-2xl font-bold font-serif">19+</div>
                                    <div className="text-xs uppercase tracking-wider text-white/80">Years of Excellence</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Side */}
                    <div>
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Nurturing Minds Since <span className="text-primary">2063 B.S.</span>
                        </h3>
                        <div className="w-16 h-1 bg-accent mb-6"></div>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Sevenstar English Boarding School, located in Devdaha Municipality-2, Rupandehi District,
                            Lumbini Province, Nepal, is a distinguished private educational institution established in 2063 B.S.
                            Strategically situated near the Rohini River Bridge in Dhekawar, we provide an accessible and serene
                            environment blending modern education with cultural values.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            Offering classes from early childhood through +2 with NEB-affiliated programs in Management,
                            Computer Science, Hotel Management, Finance, and Education — we empower students with knowledge,
                            critical thinking, and ethical values.
                        </p>
                        <a href="#programs" className="btn-primary inline-flex items-center gap-2">
                            View Programs
                        </a>
                    </div>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 font-serif">Our Mission</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            To offer quality education that prepares students for both national and global challenges.
                            We empower students with knowledge, critical thinking skills, and ethical values,
                            preparing them to contribute meaningfully to society as responsible global citizens.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-l-accent hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                                <Flag className="w-6 h-6 text-accent-dark" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 font-serif">Our Vision</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            To shine brightly in the educational landscape of Lumbini Province, guiding students
                            toward success. We aspire to be recognized as a premier institution that sets the standard
                            for English-medium education, blending tradition with innovation in Rupandehi.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
