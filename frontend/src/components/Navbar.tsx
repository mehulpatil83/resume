import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <FileText size={20} />
                        </div>
                        ResumeAI
                    </Link>

                    <div className="flex items-center gap-4">
                        {location.pathname !== '/builder' && (
                            <Link to="/builder">
                                <Button variant="default" size="sm" className="font-medium shadow-md shadow-blue-500/20">
                                    Create New Resume
                                </Button>
                            </Link>
                        )}
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-slate-600 dark:text-slate-400">
                            Sign In
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
