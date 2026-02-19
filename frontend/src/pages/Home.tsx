import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
            {/* Background decorative elements */}
            <div className="absolute top-(-10%) left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <main className="max-w-4xl w-full text-center space-y-12 z-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                        🚀 AI-Powered Career Growth
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-slate-900 dark:text-white drop-shadow-sm">
                        Craft Your Perfect Resume <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            in Seconds
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Stand out from the crowd with resumes tailored to every job description.
                        Let our advanced AI analyze, optimize, and format your experience for maximum impact.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/builder" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6 h-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300">
                            Build My Resume
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-10 py-6 h-auto bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white/80 transition-all duration-300">
                        View Examples
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 text-left">
                    <FeatureCard
                        icon="🤖"
                        title="AI Extraction"
                        description="Upload your old resume and let our AI extract your skills and experience automatically."
                    />
                    <FeatureCard
                        icon="🎯"
                        title="Smart Targeting"
                        description="Paste a job description and get a resume perfectly tailored to the role's requirements."
                    />
                    <FeatureCard
                        icon="✨"
                        title="Premium Templates"
                        description="Clean, modern, and ATS-friendly templates designed to get you hired."
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-105 duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
);

export default Home;
