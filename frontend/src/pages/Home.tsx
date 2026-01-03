// React import removed as it is not needed in new JSX transform and was causing unused var warning
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl text-center space-y-8">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    AI-Powered Resume Generator
                </h1>
                <p className="text-xl text-muted-foreground">
                    Tailor your resume to any job description instantly using advanced AI agents.
                    Increase your ATS score and land more interviews.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/builder">
                        <Button size="lg" className="text-lg px-8">
                            Get Started
                        </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="text-lg px-8">
                        Learn More
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Home;
